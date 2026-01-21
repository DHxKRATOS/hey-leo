"use strict";

const socialAuthUtils = require("../../../middlewares/auth");

module.exports = {
  async googleCallback(ctx) {
    try {
      const { idToken, accessToken } = ctx.request.body;

      if (!idToken) {
        return ctx.badRequest("ID token is required");
      }

      // Decode Google ID token to get user info
      let payload;
      try {
        payload = JSON.parse(
          Buffer.from(idToken.split(".")[1], "base64").toString()
        );
      } catch (error) {
        return ctx.badRequest("Invalid Google ID token format");
      }

      const {
        email,
        name,
        given_name,
        family_name,
        picture,
        sub: googleId,
      } = payload;

      // let profile;
      // try {
      //   const response = await fetch(
      //     "https://openidconnect.googleapis.com/v1/userinfo",
      //     {
      //       headers: {
      //         Authorization: `Bearer ${accessToken}`,
      //       },
      //     }
      //   );

      //   if (!response.ok) {
      //     return ctx.badRequest("Failed to fetch Google profile");
      //   }

      //   profile = await response.json();
      // } catch (err) {
      //   console.error("Google userinfo fetch error:", err);
      //   return ctx.badRequest("Error fetching Google profile");
      // }

      if (!email) {
        return ctx.badRequest("Email not provided by Google");
      }

      // Check if user already exists
      let user = await strapi.db.query("api::user.user").findOne({
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

      let isNewUser = false;

      if (!user) {
        // Create new user only if doesn't exist
        isNewUser = true;
        user = await strapi.db.query("api::user.user").create({
          data: {
            email,
            name: name || `${given_name} ${family_name}`.trim(),
            login_type: "GOOGLE",
            google_id: googleId,
            avatar_url: picture,
            confirmed: true,
            blocked: false,
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

        // Assign starter plan by default for new users
        const starterPlan = await strapi.db.query("api::plan.plan").findOne({
          where: { name: "Starter" },
        });

        if (starterPlan) {
          await strapi.db
            .query("api::user-subscription-plan.user-subscription-plan")
            .create({
              data: {
                user: user.id,
                plan: starterPlan.id,
                plan_start_date: new Date(),
                billing_cycle: "monthly",
                status: "active",
                payment_status: "completed",
              },
            });
        }

        // Re-fetch user with subscription data
        user = await strapi.db.query("api::user.user").findOne({
          where: { id: user.id },
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

        // Create a default card for new Google users
        // await this.createDefaultCard(user, {
        //   firstName: given_name || name?.split(' ')[0] || '',
        //   lastName: family_name || name?.split(' ').slice(1).join(' ') || '',
        //   email,
        //   photo: picture,
        //   company: email.split("@")[1]?.split(".")[0] || "",
        // });
      } else {
        // Update last login and Google ID if not set for existing user
        await strapi.db.query("api::user.user").update({
          where: { id: user.id },
          data: {
            last_login: new Date(),
            google_id: user.google_id || googleId,
            avatar_url: user.avatar_url || picture,
          },
        });
      }

      // Generate JWT token
      const token = socialAuthUtils.signToken({
        id: user.id,
        email: user.email,
      });

      // Get active subscription
      const activeSubscription = user.user_subscription_plans?.find(
        (sub) => sub.status === "active"
      );

      ctx.send({
        jwt: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          preferences: user.preferences,
          provider: "google",
          isNewUser,
          socialData: {
            firstName: given_name,
            lastName: family_name,
            email,
            photo: picture,
            company: email.split("@")[1]?.split(".")[0] || "", // Extract company from email domain
          },
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
    } catch (error) {
      console.error("Google authentication error:", error);
      return ctx.internalServerError("Google authentication failed");
    }
  },

  async linkedinCallback(ctx) {
    try {
      const { code, accessToken, userData } = ctx.request.body;

      if (!userData || !userData.email) {
        return ctx.badRequest("LinkedIn user data is required");
      }

      const {
        email,
        localizedFirstName,
        localizedLastName,
        profilePicture,
        id: linkedinId,
      } = userData;
      const name = `${localizedFirstName} ${localizedLastName}`.trim();

      // Check if user already exists
      let user = await strapi.db.query("api::user.user").findOne({
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

      let isNewUser = false;

      if (!user) {
        // Create new user only if doesn't exist
        isNewUser = true;
        user = await strapi.db.query("api::user.user").create({
          data: {
            email,
            name,
            login_type: "LINKEDIN",
            linkedin_id: linkedinId,
            avatar_url: profilePicture?.displayImage,
            confirmed: true,
            blocked: false,
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

        // Assign starter plan by default for new users
        const starterPlan = await strapi.db.query("api::plan.plan").findOne({
          where: { name: "Starter" },
        });

        if (starterPlan) {
          await strapi.db
            .query("api::user-subscription-plan.user-subscription-plan")
            .create({
              data: {
                user: user.id,
                plan: starterPlan.id,
                plan_start_date: new Date(),
                billing_cycle: "monthly",
                status: "active",
                payment_status: "completed",
              },
            });
        }

        // Re-fetch user with subscription data
        user = await strapi.db.query("api::user.user").findOne({
          where: { id: user.id },
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

        // Create a default card for new LinkedIn users
        // await this.createDefaultCard(user, {
        //   firstName: localizedFirstName,
        //   lastName: localizedLastName,
        //   email,
        //   photo: profilePicture?.displayImage,
        //   company: userData.positions?.values?.[0]?.company?.name || "",
        //   jobTitle: userData.headline || "",
        //   location: userData.location?.name || "",
        //   bio: userData.summary || "",
        // });
      } else {
        // Update last login and LinkedIn ID if not set for existing user
        await strapi.db.query("api::user.user").update({
          where: { id: user.id },
          data: {
            last_login: new Date(),
            linkedin_id: user.linkedin_id || linkedinId,
            avatar_url: user.avatar_url || profilePicture?.displayImage,
          },
        });
      }

      // Generate JWT token
      const token = socialAuthUtils.signToken({
        id: user.id,
        email: user.email,
      });

      // Get active subscription
      const activeSubscription = user.user_subscription_plans?.find(
        (sub) => sub.status === "active"
      );

      ctx.send({
        jwt: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          preferences: user.preferences,
          provider: "linkedin",
          isNewUser,
          socialData: {
            firstName: localizedFirstName,
            lastName: localizedLastName,
            email,
            photo: profilePicture?.displayImage,
            // LinkedIn provides more professional data
            jobTitle: userData.headline || "",
            company: userData.positions?.values?.[0]?.company?.name || "",
            location: userData.location?.name || "",
            bio: userData.summary || "",
          },
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
    } catch (error) {
      console.error("LinkedIn authentication error:", error);
      return ctx.internalServerError("LinkedIn authentication failed");
    }
  },

  // Helper method to create default card for new OAuth users
  async createDefaultCard(user: any, socialData: any) {
    try {
      const cardName = `${socialData.firstName}'s Card`;
      const profileLink = `${socialData.firstName.toLowerCase()}${socialData.lastName.toLowerCase()}${Date.now()}`;

      await strapi.db.query("api::card.card").create({
        data: {
          card_creation_type: "social",
          card_name: cardName,
          first_name: socialData.firstName,
          last_name: socialData.lastName,
          job_title: socialData.jobTitle || "",
          company: socialData.company || "",
          professional_bio_type: "own",
          description:
            socialData.bio ||
            `Professional profile for ${socialData.firstName} ${socialData.lastName}`,
          email: socialData.email,
          phone: "",
          linkedin_url: "",
          calendar_url: "",
          card_profile_link: profileLink,
          twitter_url: "",
          instagram_url: "",
          website_url: "",
          portfolio_url: "",
          calendly_url: "",
          custom_links: [],
          location: socialData.location || "",
          documents: [],
          additional_information: "",
          status: "active",
          card_type: "business",
          card_views: 0,
          card_leads: 0,
          created_by: user.id,
          updated_by: user.id,
          user: user.id,
        },
      });
    } catch (error) {
      console.error("Error creating default card:", error);
      // Don't throw error to avoid breaking the OAuth flow
    }
  },
};
