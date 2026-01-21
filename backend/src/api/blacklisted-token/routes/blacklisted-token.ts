'use strict';

/**
 * blacklisted-token router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::blacklisted-token.blacklisted-token');
