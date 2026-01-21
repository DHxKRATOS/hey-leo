import { Context, Next } from 'koa';

export default () => {
  return async (ctx: Context, next: Next) => {
    // Completely exclude all admin routes from token blacklist middleware
    if (ctx.path.startsWith('/admin')) {
      await next();
      return;
    }

    // Skip blacklist check for non-protected routes
    const protectedRoutes = ['/api/auth/profile', '/api/auth/change-password', '/api/auth/toggle-2fa', '/api/subscription', '/api/cards'];
    const publicRoutes = ['/api/auth/register', '/api/auth/login', '/api/subscription/plans', '/api/public/cards'];
    const isProtectedRoute = protectedRoutes.some(route => ctx.path.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => ctx.path.startsWith(route));
    
    if (!isProtectedRoute || isPublicRoute) {
      await next();
      return;
    }

    const authHeader = ctx.request.header.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await next();
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      await next();
      return;
    }

    try {
      // Check if token is blacklisted
      const blacklistedToken = await strapi.db.query('api::blacklisted-token.blacklisted-token').findOne({
        where: { token }
      });

      if (blacklistedToken) {
        ctx.status = 401;
        ctx.body = {
          data: null,
          error: {
            status: 401,
            name: 'UnauthorizedError',
            message: 'Token has been invalidated',
            details: {}
          }
        };
        return;
      }

      // Clean up expired blacklisted tokens (optional optimization)
      const now = new Date();
      await strapi.db.query('api::blacklisted-token.blacklisted-token').deleteMany({
        where: {
          expires_at: {
            $lt: now
          }
        }
      });

      await next();
    } catch (error) {
      console.error('Token blacklist middleware error:', error);
      await next();
    }
  };
};
