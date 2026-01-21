'use strict';

/**
 * blacklisted-token service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::blacklisted-token.blacklisted-token');
