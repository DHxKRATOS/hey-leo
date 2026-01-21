"use strict";

module.exports = {
  /**
   * Contact service for business logic
   */

  async validateContactData(data) {
    const errors = [];

    // Required fields validation
    if (!data.first_name || data.first_name.trim() === '') {
      errors.push('First name is required');
    }
    if (!data.last_name || data.last_name.trim() === '') {
      errors.push('Last name is required');
    }
    if (!data.email || data.email.trim() === '') {
      errors.push('Email is required');
    }

    // Email format validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    // Phone format validation (if provided)
    if (data.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Invalid phone number format');
      }
    }

    // URL validations
    const urlFields = ['company_website', 'website', 'linkedin_url'];
    urlFields.forEach(field => {
      if (data[field]) {
        try {
          new URL(data[field]);
        } catch {
          errors.push(`Invalid ${field.replace('_', ' ')} URL format`);
        }
      }
    });

    // Tags validation
    if (data.tags && !Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  async checkEmailUniqueness(email, userId, excludeContactId = null) {
    const whereClause: any = {
      email,
      user: userId
    };

    if (excludeContactId) {
      whereClause.id = { $ne: excludeContactId };
    }

    const existingContact = await strapi.db.query("api::contact.contact").findOne({
      where: whereClause,
    });

    return !existingContact;
  },

  async buildSearchQuery(userId, filters: any = {}) {
    let whereClause: any = { user: userId };

    const { search, company, source, tags } = filters;

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
          { notes: { $containsi: search } },
        ],
      };
    }

    // Company filter
    if (company) {
      whereClause.company = { $containsi: company };
    }

    // Source filter
    if (source) {
      whereClause.source = source;
    }

    // Tags filter
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      whereClause.tags = { $in: tagsArray };
    }

    return whereClause;
  },

  async getContactStats(userId) {
    const totalContacts = await strapi.db.query("api::contact.contact").count({
      where: { user: userId },
    });

    const contactsBySource = await strapi.db.query("api::contact.contact").findMany({
      where: { user: userId },
      select: ['source'],
    });

    const sourceStats = contactsBySource.reduce((acc, contact) => {
      acc[contact.source] = (acc[contact.source] || 0) + 1;
      return acc;
    }, {});

    const recentContacts = await strapi.db.query("api::contact.contact").count({
      where: {
        user: userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      },
    });

    return {
      total: totalContacts,
      bySource: sourceStats,
      recentlyAdded: recentContacts,
    };
  },

  async exportContacts(userId, format = 'json') {
    const contacts = await strapi.db.query("api::contact.contact").findMany({
      where: { user: userId },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'first_name', 'last_name', 'email', 'phone', 'job_title', 
        'company', 'company_website', 'website', 'address', 'city', 
        'state', 'country', 'source', 'linkedin_url', 'tags', 'notes',
        'created_at', 'updated_at'
      ];

      const csvRows = [
        headers.join(','),
        ...contacts.map(contact => 
          headers.map(header => {
            let value = contact[header] || '';
            if (header === 'tags' && Array.isArray(value)) {
              value = value.join(';');
            }
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];

      return csvRows.join('\n');
    }

    return contacts;
  },
};
