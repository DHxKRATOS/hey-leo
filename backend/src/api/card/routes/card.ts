module.exports = {
  routes: [
    {
      method: "POST",
      path: "/cards",
      handler: "card.create",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "GET",
      path: "/cards",
      handler: "card.find",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "GET",
      path: "/cards/:id",
      handler: "card.findOne",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "PUT",
      path: "/cards/:id",
      handler: "card.update",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "DELETE",
      path: "/cards/:id",
      handler: "card.delete",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "POST",
      path: "/cards/:id/views",
      handler: "card.incrementViews",
      config: {
        auth: false,
        middlewares: ["global::apiToken"],
      },
    },
    {
      method: "POST",
      path: "/cards/:id/leads",
      handler: "card.incrementLeads",
      config: {
        auth: false,
        middlewares: ["global::apiToken"],
      },
    },
    {
      method: "GET",
      path: "/public/cards/:profileLink",
      handler: "card.findByProfileLink",
      config: {
        auth: false,
        middlewares: ["global::apiToken"],
      },
    },
    {
      method: "PUT",
      path: "/cards/:id/contact-capture",
      handler: "card.updateContactCapture",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "POST",
      path: "/public/cards/:profileLink/contact-form",
      handler: "card.submitContactForm",
      config: {
        auth: false,
        middlewares: ["global::apiToken"],
      },
    },
    // {
    //   method: "PUT",
    //   path: "/cards/:id/contact-capture",
    //   handler: "card.submitContactForm",
    //   config: {
    //     policies: [],
    //   },
    // },
    {
      method: "PUT",
      path: "/cards/:id/training-data",
      handler: "card.updateTrainingData",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "POST",
      path: "/cards/:id/training-documents",
      handler: "card.uploadTrainingDocument",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "DELETE",
      path: "/cards/:id/training-documents/:documentId",
      handler: "card.deleteTrainingDocument",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
  ],
};
