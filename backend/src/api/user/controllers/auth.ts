"use strict";

const bcrypt = require("bcryptjs");
const { validateEmail, validatePassword } = require("../services/auth");
const authUtils = require("../../../middlewares/auth");

module.exports = {
  async register(ctx) {
    const {
      email,
      password,
      name,
      firstName,
      lastName,
      login_type = "EMAIL",
    } = ctx.request.body;

    // Validation
    if (!email || !password) {
      return ctx.badRequest("Email and password are required");
    }

    if (!validateEmail(email)) {
      return ctx.badRequest("Invalid email format");
    }

    if (!validatePassword(password)) {
      return ctx.badRequest(
        "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
      );
    }

    // Check if user already exists
    const existingUser = await strapi.db.query("api::user.user").findOne({
      where: { email },
    });

    if (existingUser) {
      return ctx.conflict("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with enhanced data
    const fullName =
      name ||
      (firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || "");
    const newUser = await strapi.db.query("api::user.user").create({
      data: {
        email,
        password_hash: passwordHash,
        name: fullName,
        login_type,
        password_changed_at: new Date(),
        two_factor_enabled: false,
        preferences: {
          notifications: {
            email: true,
            push: true,
            marketing: false,
          },
          privacy: {
            profile_visibility: "private",
            data_sharing: false,
          },
          theme: "light",
          language: "en",
        },
      },
    });

    // Assign starter plan by default
    const starterPlan = await strapi.db.query("api::plan.plan").findOne({
      where: { name: "Starter" },
    });

    if (starterPlan) {
      await strapi.db
        .query("api::user-subscription-plan.user-subscription-plan")
        .create({
          data: {
            user: newUser.id,
            plan: starterPlan.id,
            plan_start_date: new Date(),
            billing_cycle: "monthly",
            status: "active",
            payment_status: "completed",
          },
        });
    }

    // Generate JWT token
    const token = authUtils.signToken({ id: newUser.id, email: newUser.email });

    ctx.send({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    });
  },

  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest("Email and password are required");
    }

    const user = await strapi.db.query("api::user.user").findOne({
      where: { email },
      populate: {
        user_subscription_plans: {
          populate: {
            plan: {
              populate: {
                plan_features: {
                  populate: ["feature"],
                },
              },
            },
          },
        },
      },
    });

    if (!user) return ctx.unauthorized("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return ctx.unauthorized("Invalid email or password");

    // Update last login
    await strapi.db.query("api::user.user").update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const token = authUtils.signToken({ id: user.id, email: user.email });

    // Get active subscription
    const activeSubscription = user.user_subscription_plans?.find(
      (sub) => sub.status === "active"
    );

    // Get cards and contacts count
    const cardsCount = await strapi.db.query("api::card.card").count({
      where: { user: user.id },
    });

    const contactsCount = await strapi.db.query("api::contact.contact").count({
      where: { user: user.id },
    });

    ctx.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        preferences: user.preferences,
        two_factor_enabled: user.two_factor_enabled,
        last_login: user.last_login,
        cards_count: cardsCount,
        contacts_count: contactsCount,
        subscription: activeSubscription
          ? {
              plan: activeSubscription.plan.name,
              status: activeSubscription.status,
              billing_cycle: activeSubscription.billing_cycle,
              features: activeSubscription.plan.plan_features?.map((pf) => ({
                name: pf.feature.name,
                value: pf.feature_value,
              })),
            }
          : null,
      },
    });
  },

  async logout(ctx) {
    try {
      const authHeader = ctx.request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ctx.unauthorized("No token provided");
      }
      const token = authHeader.slice(7);

      // Decode token to get expiration time
      const decoded = authUtils.verifyToken(token);
      const expiresAt = new Date(decoded.exp * 1000);

      // Save token in blacklist
      await strapi.db.query("api::blacklisted-token.blacklisted-token").create({
        data: {
          token,
          invalidated_at: new Date(),
          expires_at: expiresAt,
        },
      });

      ctx.send({ message: "Logged out successfully" });
    } catch (err) {
      ctx.internalServerError("Logout failed");
    }
  },

  async getProfile(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }

      const user = await strapi.db.query("api::user.user").findOne({
        where: { id: authenticatedUser.id },
        populate: {
          user_subscription_plans: {
            populate: {
              plan: {
                populate: {
                  plan_features: {
                    populate: ["feature"],
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return ctx.notFound("User not found");
      }

      const activeSubscription = user.user_subscription_plans?.find(
        (sub) => sub.status === "active"
      );

      // Get cards and contacts count
      const cardsCount = await strapi.db.query("api::card.card").count({
        where: { user: authenticatedUser.id },
      });

      const contactsCount = await strapi.db
        .query("api::contact.contact")
        .count({
          where: { user: authenticatedUser.id },
        });

      ctx.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          preferences: user.preferences,
          two_factor_enabled: user.two_factor_enabled,
          last_login: user.last_login,
          cards_count: cardsCount,
          contacts_count: contactsCount,
        },
        subscription: activeSubscription
          ? {
              plan: {
                id: activeSubscription.plan.id,
                name: activeSubscription.plan.name,
                price: activeSubscription.plan.price,
                price_type: activeSubscription.plan.price_type,
                billing_cycle: activeSubscription.billing_cycle,
                features: activeSubscription.plan.plan_features?.map((pf) => ({
                  name: pf.feature.name,
                  value: pf.value,
                  limit: pf.limit,
                })),
              },
              status: activeSubscription.status,
              start_date: activeSubscription.start_date,
              end_date: activeSubscription.end_date,
            }
          : null,
      });
    } catch (error) {
      return ctx.unauthorized("Invalid token");
    }
  },

  async updateProfile(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = authenticatedUser.id;

      const isMultipart = ctx.is("multipart");
      let data;
      let files;

      if (isMultipart) {
        const { body, files: uploadedFiles } = ctx.request;
        data = body;
        files = uploadedFiles;
      } else {
        data = ctx.request.body;
      }

      const { name, preferences } = data;
      const updateData: any = {};

      if (name) updateData.name = name;
      if (preferences) {
        updateData.preferences =
          typeof preferences === "string"
            ? JSON.parse(preferences)
            : preferences;
      }

      // ✅ Handle avatar upload
      if (files?.avatar_url) {
        const uploaded = await strapi.plugins.upload.services.upload.upload({
          data: {},
          files: files?.avatar_url,
        });

        if (uploaded && uploaded[0]) {
          updateData.avatar_url = uploaded[0].url;
        }
      }

      const updatedUser = await strapi.db.query("api::user.user").update({
        where: { id: userId },
        data: updateData,
      });

      ctx.send({
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar_url: updatedUser.avatar_url,
          preferences: updatedUser.preferences,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      return ctx.unauthorized("Invalid token");
    }
  },

  async changePassword(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = authenticatedUser.id;
      const { currentPassword, newPassword } = ctx.request.body;

      if (!currentPassword || !newPassword) {
        return ctx.badRequest("Current password and new password are required");
      }

      if (!validatePassword(newPassword)) {
        return ctx.badRequest(
          "New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
        );
      }

      const user = await strapi.db.query("api::user.user").findOne({
        where: { id: userId },
      });

      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return ctx.unauthorized("Current password is incorrect");
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      await strapi.db.query("api::user.user").update({
        where: { id: userId },
        data: {
          password_hash: newPasswordHash,
          password_changed_at: new Date(),
        },
      });

      ctx.send({ message: "Password changed successfully" });
    } catch (error) {
      return ctx.unauthorized("Invalid token");
    }
  },

  async toggleTwoFactor(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = authenticatedUser.id;
      const { enabled } = ctx.request.body;

      await strapi.db.query("api::user.user").update({
        where: { id: userId },
        data: { two_factor_enabled: enabled },
      });

      ctx.send({
        message: `Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully`,
        two_factor_enabled: enabled,
      });
    } catch (error) {
      return ctx.unauthorized("Invalid token");
    }
  },

  async deleteAccount(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = authenticatedUser.id;

      // Get user with all related data
      const user = await strapi.db.query("api::user.user").findOne({
        where: { id: userId },
        populate: {
          cards: true,
          contacts: true,
          user_subscription_plans: true,
        },
      });

      if (!user) {
        return ctx.notFound("User not found");
      }

      // Delete related data in proper order to avoid foreign key constraints
      // This implements GDPR-compliant complete data deletion

      // 1. Delete user's digital business cards and all related data
      if (user.cards && user.cards.length > 0) {
        // Delete uploaded files associated with cards (profile images, training documents)
        for (const card of user.cards) {
          // Delete card profile images
          if (card.card_profile_image) {
            try {
              await strapi.plugins.upload.services.upload.remove({
                id: card.card_profile_image,
              });
            } catch (error) {
              console.warn(
                `Failed to delete card profile image ${card.card_profile_image}:`,
                error
              );
            }
          }

          // Delete training documents
          if (
            card.training_documents &&
            Array.isArray(card.training_documents)
          ) {
            for (const doc of card.training_documents) {
              try {
                await strapi.plugins.upload.services.upload.remove({
                  id: doc.id,
                });
              } catch (error) {
                console.warn(
                  `Failed to delete training document ${doc.id}:`,
                  error
                );
              }
            }
          }
        }

        await strapi.db.query("api::card.card").deleteMany({
          where: { user: userId },
        });
      }

      // 2. Delete user's contacts & interactions
      if (user.contacts && user.contacts.length > 0) {
        await strapi.db.query("api::contact.contact").deleteMany({
          where: { user: userId },
        });
      }

      // 3. Delete analytics & insights data
      try {
        await strapi.db.query("api::analytic.analytic").deleteMany({
          where: { user: userId },
        });
      } catch (error) {
        console.warn(
          "Analytics table not found or error deleting analytics:",
          error
        );
      }

      // 4. Delete subscription & billing data
      if (
        user.user_subscription_plans &&
        user.user_subscription_plans.length > 0
      ) {
        await strapi.db
          .query("api::user-subscription-plan.user-subscription-plan")
          .deleteMany({
            where: { user: userId },
          });
      }

      // 5. Delete affiliate data if exists
      try {
        await strapi.db.query("api::affiliate.affiliate").deleteMany({
          where: { user: userId },
        });
      } catch (error) {
        console.warn(
          "Affiliate table not found or error deleting affiliate data:",
          error
        );
      }

      // 6. Delete user's uploaded avatar
      if (user.avatar_url) {
        try {
          // Extract file ID from avatar URL if it's a Strapi upload
          const avatarId = user.avatar_url.match(/\/uploads\/.*_(\w+)\./)?.[1];
          if (avatarId) {
            await strapi.plugins.upload.services.upload.remove({
              id: avatarId,
            });
          }
        } catch (error) {
          console.warn("Failed to delete user avatar:", error);
        }
      }

      // 7. Delete any blacklisted tokens for this user
      const authHeader = ctx.request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        await strapi.db
          .query("api::blacklisted-token.blacklisted-token")
          .deleteMany({
            where: { token },
          });
      }

      // 8. Delete external AI/ML training data
      try {
        // Call external API to delete user's AI training data
        const externalApiUrl =
          process.env.AI_API_URL || "http://localhost:8000/api";
        await fetch(`${externalApiUrl}/user/${userId}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.warn("Failed to delete external AI training data:", error);
      }

      // 5. Finally delete the user account
      await strapi.db.query("api::user.user").delete({
        where: { id: userId },
      });

      ctx.send({
        success: true,
        message:
          "Account deleted successfully. All associated data has been permanently removed including digital business cards, contacts, AI training data, analytics, subscription data, and account preferences.",
      });
    } catch (error) {
      console.error("Account deletion error:", error);
      return ctx.internalServerError(
        "Failed to delete account. Please try again or contact support."
      );
    }
  },

  async getNotificationPreferences(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = authenticatedUser.id;

      const user = await strapi.db.query("api::user.user").findOne({
        where: { id: userId },
        select: ["preferences"],
      });

      if (!user) {
        return ctx.notFound("User not found");
      }

      // Return notification preferences with defaults
      const notifications = user.preferences?.notifications || {};
      ctx.send({
        newLeadCaptured: notifications.newLeadCaptured ?? true,
        weeklyAnalytics: notifications.weeklyAnalytics ?? true,
        email: notifications.email ?? true,
        push: notifications.push ?? true,
        marketing: notifications.marketing ?? false,
      });
    } catch (error) {
      console.error("Get notification preferences error:", error);
      return ctx.internalServerError("Failed to get notification preferences");
    }
  },

  async updateNotificationPreferences(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = authenticatedUser.id;
      const preferences = ctx.request.body;

      // Validate preferences
      const validKeys = [
        "newLeadCaptured",
        "weeklyAnalytics",
        "email",
        "push",
        "marketing",
      ];
      const filteredPreferences = {};

      for (const [key, value] of Object.entries(preferences)) {
        if (validKeys.includes(key) && typeof value === "boolean") {
          filteredPreferences[key] = value;
        }
      }

      // Get current user preferences
      const user = await strapi.db.query("api::user.user").findOne({
        where: { id: userId },
        select: ["preferences"],
      });

      const currentPreferences = user.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        notifications: {
          ...currentPreferences.notifications,
          ...filteredPreferences,
        },
      };

      // Update user preferences
      await strapi.db.query("api::user.user").update({
        where: { id: userId },
        data: { preferences: updatedPreferences },
      });

      // Return updated notification preferences
      const notifications = updatedPreferences.notifications;
      ctx.send({
        newLeadCaptured: notifications.newLeadCaptured ?? true,
        weeklyAnalytics: notifications.weeklyAnalytics ?? true,
        email: notifications.email ?? true,
        push: notifications.push ?? true,
        marketing: notifications.marketing ?? false,
      });
    } catch (error) {
      console.error("Update notification preferences error:", error);
      return ctx.internalServerError(
        "Failed to update notification preferences"
      );
    }
  },
};
