module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/affiliate/stats',
      handler: 'affiliate.getStats',
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: 'POST',
      path: '/affiliate/generate-code',
      handler: 'affiliate.generateCode',
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
  ],
};
