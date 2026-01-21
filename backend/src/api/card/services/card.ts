"use strict";

module.exports = {
  validateCardData(data) {
    const errors = [];

    // Required fields validation
    if (!data.card_creation_type) {
      errors.push("card_creation_type is required");
    }

    if (!data.card_name || data.card_name.trim().length === 0) {
      errors.push("card_name is required");
    }

    if (!data.first_name || data.first_name.trim().length === 0) {
      errors.push("first_name is required");
    }

    if (!data.last_name || data.last_name.trim().length === 0) {
      errors.push("last_name is required");
    }

    if (!data.email || !this.validateEmail(data.email)) {
      errors.push("Valid email is required");
    }

    // Enum validations
    const validCreationTypes = ["google", "linkedin", "email"];
    if (data.card_creation_type && !validCreationTypes.includes(data.card_creation_type)) {
      errors.push("Invalid card_creation_type. Must be one of: google, linkedin, email");
    }

    const validBioTypes = ["own", "AI", "linkedin"];
    if (data.professional_bio_type && !validBioTypes.includes(data.professional_bio_type)) {
      errors.push("Invalid professional_bio_type. Must be one of: own, AI, linkedin");
    }

    const validStatuses = ["draft", "active", "paused"];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push("Invalid status. Must be one of: draft, active, paused");
    }

    const validCardTypes = ["business", "personal", "networking"];
    if (data.card_type && !validCardTypes.includes(data.card_type)) {
      errors.push("Invalid card_type. Must be one of: business, personal, networking");
    }

    // URL validations
    const urlFields = [
      "linkedin_url",
      "calendar_url",
      "card_profile_link",
      "twitter_url",
      "instagram_url",
      "website_url",
      "portfolio_url",
      "calendly_url"
    ];

    urlFields.forEach(field => {
      if (data[field] && !this.validateUrl(data[field])) {
        errors.push(`${field} must be a valid URL`);
      }
    });

    // Phone validation
    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push("Invalid phone number format");
    }

    return errors;
  },

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  validatePhone(phone) {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  generateProfileLink(firstName, lastName) {
    const timestamp = Date.now();
    const base = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    return `${base}${timestamp}`;
  },

  sanitizeCardData(data) {
    const sanitized = { ...data };

    // Trim string fields
    const stringFields = [
      "card_name",
      "first_name", 
      "last_name",
      "job_title",
      "company",
      "email",
      "phone",
      "location"
    ];

    stringFields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = sanitized[field].trim();
      }
    });

    // Ensure numeric fields are numbers
    if (sanitized.card_views !== undefined) {
      sanitized.card_views = Math.max(0, parseInt(sanitized.card_views) || 0);
    }

    if (sanitized.card_leads !== undefined) {
      sanitized.card_leads = Math.max(0, parseInt(sanitized.card_leads) || 0);
    }

    return sanitized;
  },

  async checkProfileLinkUnique(profileLink, excludeId = null) {
    const query: any = { card_profile_link: profileLink };
    if (excludeId) {
      query.id = { $ne: excludeId };
    }

    const existingCard = await strapi.db.query("api::card.card").findOne({
      where: query,
    });

    return !existingCard;
  },

  async generateUniqueProfileLink(firstName, lastName, excludeId = null) {
    let profileLink = this.generateProfileLink(firstName, lastName);
    let isUnique = await this.checkProfileLinkUnique(profileLink, excludeId);
    let counter = 1;

    while (!isUnique) {
      profileLink = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Date.now()}${counter}`;
      isUnique = await this.checkProfileLinkUnique(profileLink, excludeId);
      counter++;
    }

    return profileLink;
  },

  formatCardResponse(card) {
    if (!card) return null;

    return {
      id: card.id,
      card_creation_type: card.card_creation_type,
      card_name: card.card_name,
      first_name: card.first_name,
      last_name: card.last_name,
      job_title: card.job_title,
      company: card.company,
      professional_bio_type: card.professional_bio_type,
      description: card.description,
      email: card.email,
      phone: card.phone,
      linkedin_url: card.linkedin_url,
      calendar_url: card.calendar_url,
      card_profile_link: card.card_profile_link,
      card_profile_image: card.card_profile_image,
      card_views: card.card_views,
      card_leads: card.card_leads,
      twitter_url: card.twitter_url,
      instagram_url: card.instagram_url,
      website_url: card.website_url,
      portfolio_url: card.portfolio_url,
      calendly_url: card.calendly_url,
      custom_links: card.custom_links,
      location: card.location,
      documents: card.documents,
      additional_information: card.additional_information,
      status: card.status,
      card_type: card.card_type,
      created_at: card.created_at,
      updated_at: card.updated_at,
      user: card.user,
    };
  },
};
