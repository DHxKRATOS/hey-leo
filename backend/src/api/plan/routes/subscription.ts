module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/subscription/plans',
      handler: 'subscription.getPlans',
      config: {
        auth: false,
        // middlewares: ["global::apiToken"],
        middlewares: ["global::auth"],
      },
    },
    {
      method: 'POST',
      path: '/subscription/subscribe',
      handler: 'subscription.subscribeToPlan',
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: 'GET',
      path: '/subscription/current',
      handler: 'subscription.getUserSubscription',
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: 'POST',
      path: '/subscription/cancel',
      handler: 'subscription.cancelSubscription',
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: 'GET',
      path: '/subscription/history',
      handler: 'subscription.getSubscriptionHistory',
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
  ],
};
