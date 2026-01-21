module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/analytics/track',
      handler: 'analytics.track',
      config: {
        auth: false,
        middlewares: ["global::apiToken"],
      },
    },
    {
      method: 'GET',
      path: '/analytics/cards/:cardId',
      handler: 'analytics.getCardAnalytics',
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: 'GET',
      path: '/analytics/user/overview',
      handler: 'analytics.getUserAnalytics',
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
  ],
};
