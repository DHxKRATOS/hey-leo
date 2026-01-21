"use strict";

const contactAuthUtils = require("../../../middlewares/auth");

module.exports = {
  async create(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = user.id;

      const {
        first_name,
        last_name,
        email,
        phone,
        job_title,
        company,
        company_website,
        website,
        address,
        city,
        state,
        country,
        source = "manual",
        linkedin_url,
        tags,
        notes,
        last_contact,
      } = ctx.request.body;

      // Validation
      if (!first_name || !last_name || !email) {
        return ctx.badRequest(
          "Required fields: first_name, last_name, email"
        );
      }

      // Check if contact with this email already exists for this user
      const existingContact = await strapi.db.query("api::contact.contact").findOne({
        where: { email, user: userId },
      });

      if (existingContact) {
        return ctx.badRequest("Contact with this email already exists");
      }

      const newContact = await strapi.db.query("api::contact.contact").create({
        data: {
          first_name,
          last_name,
          email,
          phone,
          job_title,
          company,
          company_website,
          website,
          address,
          city,
          state,
          country,
          source,
          linkedin_url,
          tags: tags || [],
          notes,
          last_contact: last_contact || new Date().toISOString(),
          user: userId,
        },
      });

      ctx.send({
        message: "Contact created successfully",
        contact: newContact,
      });
    } catch (error) {
      console.error("Contact creation error:", error);
      return ctx.internalServerError("Failed to create contact");
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

      // Extract query parameters for filtering and searching
      const { 
        search, 
        company: companyFilter, 
        source: sourceFilter,
        tags: tagsFilter,
        page = 1, 
        pageSize = 20,
        sortBy = "updatedAt",
        sortOrder = "desc"
      } = ctx.query;

      // Build where clause
      let whereClause: any = { user: userId };

      // Search functionality
      if (search) {
        whereClause = {
          ...whereClause,
          $or: [
            { first_name: { $containsi: search } },
            { last_name: { $containsi: search } },
            { email: { $containsi: search } },
            { company: { $containsi: search } },
            { job_title: { $containsi: search } },
          ],
        };
      }

      // Company filter
      if (companyFilter) {
        whereClause.company = { $containsi: companyFilter };
      }

      // Source filter
      if (sourceFilter) {
        whereClause.source = sourceFilter;
      }

      // Tags filter (if tags contain any of the specified tags)
      if (tagsFilter) {
        const tagsArray = Array.isArray(tagsFilter) ? tagsFilter : [tagsFilter];
        whereClause.tags = { $in: tagsArray };
      }

      const contacts = await strapi.db.query("api::contact.contact").findMany({
        where: whereClause,
        populate: {
          user: {
            select: ["id", "email", "name"],
          },
        },
        orderBy: { [sortBy]: sortOrder },
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });

      // Get total count for pagination
      const totalCount = await strapi.db.query("api::contact.contact").count({
        where: whereClause,
      });

      ctx.send({
        contacts,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: totalCount,
          pageCount: Math.ceil(totalCount / pageSize),
        },
      });
    } catch (error) {
      console.error("Contacts fetch error:", error);
      return ctx.internalServerError("Failed to fetch contacts");
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

      const contact = await strapi.db.query("api::contact.contact").findOne({
        where: { id, user: userId },
        populate: {
          user: {
            select: ["id", "email", "name"],
          },
        },
      });

      if (!contact) {
        return ctx.notFound("Contact not found");
      }

      ctx.send({
        contact,
      });
    } catch (error) {
      console.error("Contact fetch error:", error);
      return ctx.internalServerError("Failed to fetch contact");
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

      // Check if contact exists and belongs to user
      const existingContact = await strapi.db.query("api::contact.contact").findOne({
        where: { id, user: userId },
      });

      if (!existingContact) {
        return ctx.notFound("Contact not found");
      }

      const {
        first_name,
        last_name,
        email,
        phone,
        job_title,
        company,
        company_website,
        website,
        address,
        city,
        state,
        country,
        source,
        linkedin_url,
        tags,
        notes,
        last_contact,
      } = ctx.request.body;

      // If email is being updated, check for duplicates
      if (email && email !== existingContact.email) {
        const duplicateContact = await strapi.db.query("api::contact.contact").findOne({
          where: { email, user: userId, id: { $ne: id } },
        });

        if (duplicateContact) {
          return ctx.badRequest("Contact with this email already exists");
        }
      }

      const updateData: any = {};
      
      // Only update fields that are provided
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (job_title !== undefined) updateData.job_title = job_title;
      if (company !== undefined) updateData.company = company;
      if (company_website !== undefined) updateData.company_website = company_website;
      if (website !== undefined) updateData.website = website;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (country !== undefined) updateData.country = country;
      if (source !== undefined) updateData.source = source;
      if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url;
      if (tags !== undefined) updateData.tags = tags;
      if (notes !== undefined) updateData.notes = notes;
      if (last_contact !== undefined) updateData.last_contact = last_contact;

      const updatedContact = await strapi.db.query("api::contact.contact").update({
        where: { id },
        data: updateData,
        populate: {
          user: {
            select: ["id", "email", "name"],
          },
        },
      });

      ctx.send({
        message: "Contact updated successfully",
        contact: updatedContact,
      });
    } catch (error) {
      console.error("Contact update error:", error);
      return ctx.internalServerError("Failed to update contact");
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

      // Check if contact exists and belongs to user
      const existingContact = await strapi.db.query("api::contact.contact").findOne({
        where: { id, user: userId },
      });

      if (!existingContact) {
        return ctx.notFound("Contact not found");
      }

      await strapi.db.query("api::contact.contact").delete({
        where: { id },
      });

      ctx.send({
        message: "Contact deleted successfully",
      });
    } catch (error) {
      console.error("Contact deletion error:", error);
      return ctx.internalServerError("Failed to delete contact");
    }
  },

  // Get unique companies for filter dropdown
  async getCompanies(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = user.id;

      const contacts = await strapi.db.query("api::contact.contact").findMany({
        where: { 
          user: userId,
          company: { $notNull: true, $ne: "" }
        },
        select: ["company"],
      });

      const companies = [...new Set(contacts.map(contact => contact.company))].sort();

      ctx.send({
        companies,
      });
    } catch (error) {
      console.error("Companies fetch error:", error);
      return ctx.internalServerError("Failed to fetch companies");
    }
  },

  // Get unique tags for filter dropdown
  async getTags(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = user.id;

      const contacts = await strapi.db.query("api::contact.contact").findMany({
        where: { 
          user: userId,
          tags: { $notNull: true }
        },
        select: ["tags"],
      });

      const allTags = contacts.reduce((acc, contact) => {
        if (contact.tags && Array.isArray(contact.tags)) {
          acc.push(...contact.tags);
        }
        return acc;
      }, []);

      const uniqueTags = [...new Set(allTags)].sort();

      ctx.send({
        tags: uniqueTags,
      });
    } catch (error) {
      console.error("Tags fetch error:", error);
      return ctx.internalServerError("Failed to fetch tags");
    }
  },
};
