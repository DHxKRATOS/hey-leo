"use strict";

const cardAuthUtils = require("../../../middlewares/auth");

module.exports = {
  async create(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }

      const userId = user.id;
      const body = ctx.request.body;

      const { card_creation_type, card_name, first_name, last_name, email } =
        body;

      // Validation
      if (!card_creation_type || !card_name || !first_name || !email) {
        return ctx.badRequest(
          "Required fields: card_creation_type, card_name, first_name, email"
        );
      }

      // Generate unique profile link
      const profileLink =
        body.card_profile_link ||
        `${first_name.toLowerCase()}${last_name.toLowerCase()}${Date.now()}`;

      const newCard = await strapi.db.query("api::card.card").create({
        data: {
          ...body, // spread karo baki fields ko
          card_profile_link: profileLink,
          created_by: userId,
          updated_by: userId,
          user: userId,

          // ✅ make sure JSON fields are never undefined
          custom_links: body.custom_links || {},
          documents: body.documents || [],
          contact_capture_fields: body.contact_capture_fields || [
            {
              name: "full_name",
              label: "Full Name",
              type: "text",
              required: true,
              enabled: true,
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              required: true,
              enabled: true,
            },
            {
              name: "phone",
              label: "Phone",
              type: "tel",
              required: false,
              enabled: false,
            },
            {
              name: "company",
              label: "Company",
              type: "text",
              required: false,
              enabled: false,
            },
            {
              name: "job_title",
              label: "Job Title",
              type: "text",
              required: false,
              enabled: false,
            },
          ],
          training_documents: body.training_documents || [],
          training_qa_pairs: body.training_qa_pairs || [],
          training_website_links: body.training_website_links || [],
        },
      });

      ctx.send({
        message: "Card created successfully",
        card: newCard,
      });
    } catch (error) {
      console.error("Card creation error:", error);
      return ctx.unauthorized("Invalid token");
    }
  },

  async find(ctx) {
    const authUtils = require("../../../middlewares/auth");
    try {
      const { user } = await authUtils.extractAndVerifyToken(ctx);
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = user.id;

      const cards = await strapi.db.query("api::card.card").findMany({
        where: { user: userId },
        populate: {
          card_profile_image: true,
          user: {
            select: ["id", "email", "name"],
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      ctx.send({
        cards,
      });
    } catch (error) {
      console.error("Cards fetch error:", error);
      return ctx.internalServerError("Failed to fetch cards");
    }
  },

  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = user.id;
      const { id } = ctx.params;

      const card = await strapi.db.query("api::card.card").findOne({
        where: { id, user: userId },
        populate: {
          card_profile_image: true,
          user: {
            select: ["id", "email", "name"],
          },
        },
      });

      if (!card) {
        return ctx.notFound("Card not found");
      }

      ctx.send({
        card,
      });
    } catch (error) {
      console.error("Card fetch error:", error);
      return ctx.unauthorized("Invalid token");
    }
  },

  async update(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = user.id;
      const { id } = ctx.params;

      // Check if card exists and belongs to user
      const existingCard = await strapi.db.query("api::card.card").findOne({
        where: { id, user: userId },
      });

      if (!existingCard) {
        return ctx.notFound("Card not found");
      }

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

      const updateData: any = {
        ...data,
        updated_by: userId,
      };

      // Handle card profile image upload
      if (files?.card_profile_image) {
        const uploaded = await strapi.plugins.upload.services.upload.upload({
          data: {},
          files: files.card_profile_image,
        });

        if (uploaded && uploaded[0]) {
          updateData.card_profile_image = uploaded[0].id;
        }
      }

      const updatedCard = await strapi.db.query("api::card.card").update({
        where: { id },
        data: updateData,
        populate: {
          card_profile_image: true,
          user: {
            select: ["id", "email", "name"],
          },
        },
      });

      let imageUrl = null;
      if (updatedCard.card_profile_image) {
        imageUrl = updatedCard.card_profile_image.url
          ? `${strapi.config.get("server.url")}${updatedCard.card_profile_image.url}`
          : null;
      }

      ctx.send({
        message: "Card updated successfully",
        // card: updatedCard,
        card: {
          ...updatedCard,
          card_profile_image_url: imageUrl,
        },
      });
    } catch (error) {
      console.error("Card update error:", error);
      return ctx.unauthorized("Invalid token");
    }
  },

  async delete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = user.id;
      const { id } = ctx.params;

      // Check if card exists and belongs to user
      const existingCard = await strapi.db.query("api::card.card").findOne({
        where: { id, user: userId },
      });

      if (!existingCard) {
        return ctx.notFound("Card not found");
      }

      await strapi.db.query("api::card.card").delete({
        where: { id },
      });

      ctx.send({
        message: "Card deleted successfully",
      });
    } catch (error) {
      console.error("Card deletion error:", error);
      return ctx.unauthorized("Invalid token");
    }
  },

  async incrementViews(ctx) {
    const { id } = ctx.params;

    try {
      const card = await strapi.db.query("api::card.card").findOne({
        where: { id },
      });

      if (!card) {
        return ctx.notFound("Card not found");
      }

      const updatedCard = await strapi.db.query("api::card.card").update({
        where: { id },
        data: {
          card_views: card.card_views + 1,
        },
      });

      ctx.send({
        message: "Card views incremented",
        views: updatedCard.card_views,
      });
    } catch (error) {
      console.error("Card views increment error:", error);
      return ctx.internalServerError("Failed to increment views");
    }
  },

  async incrementLeads(ctx) {
    const { id } = ctx.params;

    try {
      const card = await strapi.db.query("api::card.card").findOne({
        where: { id },
      });

      if (!card) {
        return ctx.notFound("Card not found");
      }

      const updatedCard = await strapi.db.query("api::card.card").update({
        where: { id },
        data: {
          card_leads: card.card_leads + 1,
        },
      });

      ctx.send({
        message: "Card leads incremented",
        leads: updatedCard.card_leads,
      });
    } catch (error) {
      console.error("Card leads increment error:", error);
      return ctx.internalServerError("Failed to increment leads");
    }
  },

  async findByProfileLink(ctx) {
    const { profileLink } = ctx.params;

    const card = await strapi.db.query("api::card.card").findOne({
      where: { card_profile_link: profileLink },
      populate: ["user"], // include related user if needed
    });

    if (!card) {
      return ctx.notFound("Card not found");
    }

    return card;
  },
  // Update contact capture settings for a card
  async updateContactCapture(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = user.id;
      const { id } = ctx.params;

      // Check if card exists and belongs to user
      const existingCard = await strapi.db.query("api::card.card").findOne({
        where: { id, user: userId },
      });

      if (!existingCard) {
        return ctx.notFound("Card not found");
      }

      const {
        contact_capture_enabled,
        contact_capture_allow_skip,
        contact_capture_header_message,
        contact_capture_fields,
      } = ctx.request.body;

      // Validate contact capture fields if provided
      if (contact_capture_fields && Array.isArray(contact_capture_fields)) {
        for (const field of contact_capture_fields) {
          if (!field.name || !field.label || !field.type) {
            return ctx.badRequest(
              "Invalid contact capture field configuration"
            );
          }
        }
      }

      const updateData: any = {
        updated_by: userId,
      };

      if (contact_capture_enabled !== undefined) {
        updateData.contact_capture_enabled = contact_capture_enabled;
      }
      if (contact_capture_allow_skip !== undefined) {
        updateData.contact_capture_allow_skip = contact_capture_allow_skip;
      }
      if (contact_capture_header_message !== undefined) {
        updateData.contact_capture_header_message =
          contact_capture_header_message;
      }
      if (contact_capture_fields !== undefined) {
        updateData.contact_capture_fields = contact_capture_fields;
      }

      const updatedCard = await strapi.db.query("api::card.card").update({
        where: { id },
        data: updateData,
        populate: {
          card_profile_image: true,
          user: {
            select: ["id", "email", "name"],
          },
        },
      });

      ctx.send({
        message: "Contact capture settings updated successfully",
        card: updatedCard,
      });
    } catch (error) {
      console.error("Contact capture update error:", error);
      return ctx.internalServerError(
        "Failed to update contact capture settings"
      );
    }
  },

  // Submit contact form data (public endpoint)
  async submitContactForm(ctx) {
    const { profileLink } = ctx.params;
    
    try {
      // Find the card by profile link
      const card = await strapi.db.query("api::card.card").findOne({
        where: {
          card_profile_link: profileLink,
          status: "active",
          contact_capture_enabled: true,
        },
      });

      if (!card) {
        return ctx.notFound("Card not found or contact capture not enabled");
      }

      const formData = ctx.request.body;

      // Validate required fields based on card's contact capture configuration
      const captureFields = card.contact_capture_fields || [];
      const requiredFields = captureFields.filter(
        (field) => field.required && field.enabled
      );

      for (const field of requiredFields) {
        if (!formData[field.name]) {
          return ctx.badRequest(`${field.label} is required`);
        }
      }

      // Create contact record
      const contactData = {
        first_name: formData.full_name
          ? formData.full_name.split(" ")[0]
          : formData.first_name || "",
        last_name: formData.full_name
          ? formData.full_name.split(" ").slice(1).join(" ")
          : formData.last_name || "",
        email: formData.email,
        phone: formData.phone,
        job_title: formData.job_title,
        company: formData.company,
        source: "card_scan",
        captured_data: formData,
        user: card.user || card.created_by,
        card: card.id,
      };

      // Remove empty fields
      Object.keys(contactData).forEach((key) => {
        if (
          contactData[key] === "" ||
          contactData[key] === null ||
          contactData[key] === undefined
        ) {
          delete contactData[key];
        }
      });

      const newContact = await strapi.db.query("api::contact.contact").create({
        data: contactData,
      });

      // Increment card leads
      await strapi.db.query("api::card.card").update({
        where: { id: card.id },
        data: {
          card_leads: card.card_leads + 1,
        },
      });

      ctx.send({
        message: "Contact information submitted successfully",
        contact: {
          id: newContact.id,
          submitted_at: newContact.createdAt,
        },
      });
    } catch (error) {
      console.error("Contact form submission error:", error);
      return ctx.internalServerError("Failed to submit contact form");
    }
  },

  async updateTrainingData(ctx) {
    const { id } = ctx.params;
    const {
      training_documents,
      training_website_links,
      training_qa_pairs,
      training_free_text,
    } = ctx.request.body;

    try {
      // Verify user owns this card
      const card: any = await strapi.entityService.findOne(
        "api::card.card",
        id,
        {
          populate: { user: true },
        }
      );

      if (!card) {
        return ctx.notFound("Card not found");
      }

      if (card.user.id !== ctx.state.user.id) {
        return ctx.forbidden("You can only update your own cards");
      }

      // Update training data
      const updatedCard = await strapi.entityService.update(
        "api::card.card",
        id,
        {
          data: {
            training_documents: training_documents || [],
            training_website_links: training_website_links || [],
            training_qa_pairs: training_qa_pairs || [],
            training_free_text: training_free_text || "",
            ai_training_status: "not_started",
            ai_training_last_updated: new Date(),
          },
        }
      );

      ctx.send({
        message: "Training data updated successfully",
        card: updatedCard,
      });
    } catch (error) {
      console.error("Training data update error:", error);
      return ctx.internalServerError("Failed to update training data");
    }
  },

  async uploadTrainingDocument(ctx) {
    const { id } = ctx.params;

    try {
      // Verify user owns this card
      const card: any = await strapi.entityService.findOne(
        "api::card.card",
        id,
        {
          populate: { user: true },
        }
      );

      if (!card) {
        return ctx.notFound("Card not found");
      }

      if (card.user.id !== ctx.state.user.id) {
        return ctx.forbidden("You can only update your own cards");
      }

      // Handle file upload
      const files = ctx.request.files;
      if (!files || !files.document) {
        return ctx.badRequest("No document file provided");
      }

      const uploadedFiles = Array.isArray(files.document)
        ? files.document
        : [files.document];
      const documentEntries = [];

      for (const file of uploadedFiles) {
        // Upload file to Strapi's upload system
        const uploadedFile = await strapi.plugins.upload.services.upload.upload(
          {
            data: {
              fileInfo: {
                name: file.name,
                caption: file.name,
                alternativeText: file.name,
              },
            },
            files: file,
          }
        );

        documentEntries.push({
          id: uploadedFile[0].id,
          name: uploadedFile[0].name,
          url: uploadedFile[0].url,
          size: uploadedFile[0].size,
          mime: uploadedFile[0].mime,
          uploadedAt: new Date(),
        });
      }

      // Get current training documents and add new ones
      const currentDocuments = card.training_documents || [];
      const updatedDocuments = [...currentDocuments, ...documentEntries];

      // Update card with new documents
      const updatedCard = await strapi.entityService.update(
        "api::card.card",
        id,
        {
          data: {
            training_documents: updatedDocuments,
            ai_training_status: "not_started",
            ai_training_last_updated: new Date(),
          },
        }
      );

      ctx.send({
        message: "Training documents uploaded successfully",
        card: { ...updatedCard, documents: documentEntries },
      });
    } catch (error) {
      console.error("Training document upload error:", error);
      return ctx.internalServerError("Failed to upload training documents");
    }
  },

  async deleteTrainingDocument(ctx) {
    const { id, documentId } = ctx.params;

    try {
      // Verify user owns this card
      const card: any = await strapi.entityService.findOne(
        "api::card.card",
        id,
        {
          populate: { user: true },
        }
      );

      if (!card) {
        return ctx.notFound("Card not found");
      }

      if (card.user.id !== ctx.state.user.id) {
        return ctx.forbidden("You can only update your own cards");
      }

      // Remove document from training_documents array
      const currentDocuments = card.training_documents || [];
      const updatedDocuments = currentDocuments.filter(
        (doc) => doc.id !== documentId
      );

      // Update card
      const updatedCard = await strapi.entityService.update(
        "api::card.card",
        id,
        {
          data: {
            training_documents: updatedDocuments,
            ai_training_status: "not_started",
            ai_training_last_updated: new Date(),
          },
        }
      );

      // Delete the actual file from Strapi's upload system
      try {
        await strapi.plugins.upload.services.upload.remove({ id: documentId });
      } catch (fileDeleteError) {
        console.warn(
          "Could not delete file from upload system:",
          fileDeleteError
        );
      }

      ctx.send({
        message: "Training document deleted successfully",
        card: updatedCard,
      });
    } catch (error) {
      console.error("Training document deletion error:", error);
      return ctx.internalServerError("Failed to delete training document");
    }
  },
};
