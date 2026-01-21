"use strict";

// API Token middleware function for public routes
const apiTokenMiddleware = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      const authHeader = ctx.request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ctx.unauthorized("No API token provided");
      }

      const token = authHeader.slice(7);
      const expectedToken = process.env.STRAPI_API_TOKEN;
      
      if (!expectedToken) {
        return ctx.unauthorized("STRAPI_API_TOKEN not configured");
      }
      
      if (token !== expectedToken) {
        return ctx.unauthorized("Invalid API token");
      }
      
      // Set a flag to indicate API token authentication
      ctx.state.apiTokenAuth = true;
      await next();
    } catch (error) {
      return ctx.unauthorized(error.message);
    }
  };
};

module.exports = apiTokenMiddleware;
