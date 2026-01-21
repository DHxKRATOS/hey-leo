"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/contacts",
      handler: "contact.create",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "GET",
      path: "/contacts",
      handler: "contact.find",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "GET",
      path: "/contacts/:id",
      handler: "contact.findOne",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "PUT",
      path: "/contacts/:id",
      handler: "contact.update",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "DELETE",
      path: "/contacts/:id",
      handler: "contact.delete",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "GET",
      path: "/contacts/meta/companies",
      handler: "contact.getCompanies",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
    {
      method: "GET",
      path: "/contacts/meta/tags",
      handler: "contact.getTags",
      config: {
        auth: false,
        middlewares: ["global::auth"],
      },
    },
  ],
};
