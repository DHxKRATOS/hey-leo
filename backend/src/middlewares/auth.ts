"use strict";

const jsonwebtoken = require("jsonwebtoken");

// Utility function to verify JWT token and return decoded data
const verifyToken = (token) => {
  try {
    return jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    );
  } catch (error) {
    throw new Error("Invalid JWT token");
  }
};


// Utility function to sign JWT token
const signToken = (payload, options = {}) => {
  return jsonwebtoken.sign(
    payload,
    process.env.JWT_SECRET || "default-secret",
    {
      expiresIn: "7d",
      ...options,
    }
  );
};

// Utility function to extract and verify JWT token from request
const extractAndVerifyToken = async (ctx) => {
  const authHeader = ctx.request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No JWT token provided");
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);

  const user = await strapi.db.query("api::user.user").findOne({
    where: { id: decoded.id },
  });

  if (!user) {
    throw new Error("Invalid token - user not found");
  }

  return { decoded, user, token };
};


// Main middleware function
const authMiddleware = (config, { strapi }) => {
  return async (ctx, next) => {
    // Skip auth for public routes and admin routes
    const publicRoutes = [
      "/api/auth/register",
      "/api/auth/login",
      "/api/subscription/plans",
      "/api/public",
    ];

    // Completely exclude all admin routes from custom auth middleware
    if (ctx.path.startsWith("/admin")) {
      await next();
      return;
    }

    const isPublicRoute = publicRoutes.some((route) =>
      ctx.path.startsWith(route)
    );

    if (isPublicRoute) {
      await next();
      return;
    }

    try {
      const { user, token } = await extractAndVerifyToken(ctx);

      // Check if token is blacklisted
      const blacklistedToken = await strapi.db
        .query("api::blacklisted-token.blacklisted-token")
        .findOne({
          where: { token },
        });

      if (blacklistedToken) {
        return ctx.unauthorized("Token has been invalidated");
      }

      ctx.state.user = user;
      await next();
    } catch (error) {
      return ctx.unauthorized(error.message);
    }
  };
};

// Export both the middleware and utility functions
module.exports = authMiddleware;
module.exports.verifyToken = verifyToken;
module.exports.signToken = signToken;
module.exports.extractAndVerifyToken = extractAndVerifyToken;
