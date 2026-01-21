module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/auth/register',
        handler: 'auth.register',
        config: {
          auth: false,
        },
      },
      {
        method: 'POST',
        path: '/auth/login',
        handler: 'auth.login',
        config: {
          auth: false,
        },
      },
      {
        method: 'POST',
        path: '/auth/logout',
        handler: 'auth.logout',
        config: {
          auth: false,
          middlewares: ["global::auth"],
        },
      },
      {
        method: 'GET',
        path: '/auth/profile',
        handler: 'auth.getProfile',
        config: {
          auth: false,
          middlewares: ["global::auth"],
        },
      },
      {
        method: 'PUT',
        path: '/auth/profile',
        handler: 'auth.updateProfile',
        config: {
          auth: false,
          middlewares: ["global::auth"],
        },
      },
      {
        method: 'POST',
        path: '/auth/change-password',
        handler: 'auth.changePassword',
        config: {
          auth: false,
          middlewares: ["global::auth"],
        },
      },
      {
        method: 'POST',
        path: '/auth/toggle-2fa',
        handler: 'auth.toggleTwoFactor',
        config: {
          auth: false,
          middlewares: ["global::auth"],
        },
      },
      {
        method: 'DELETE',
        path: '/auth/account',
        handler: 'auth.deleteAccount',
        config: {
          auth: false,
          middlewares: ["global::auth"],
        },
      },
      {
        method: 'GET',
        path: '/auth/notifications',
        handler: 'auth.getNotificationPreferences',
        config: {
          auth: false,
          middlewares: ["global::auth"],
        },
      },
      {
        method: 'PUT',
        path: '/auth/notifications',
        handler: 'auth.updateNotificationPreferences',
        config: {
          auth: false,
          middlewares: ["global::auth"],
        },
      },
      {
        method: 'POST',
        path: '/auth/google/callback',
        handler: 'social-auth.googleCallback',
        config: {
          auth: false,
        },
      },
      {
        method: 'POST',
        path: '/auth/linkedin/callback',
        handler: 'social-auth.linkedinCallback',
        config: {
          auth: false,
        },
      },
    ],
  };
  