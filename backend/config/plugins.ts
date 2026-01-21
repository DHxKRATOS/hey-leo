export default ({ env }) => ({
  "users-permissions": {
    config: {
      providers: {
        google: {
          enabled: true,
          icon: "google",
          key: env("GOOGLE_CLIENT_ID"),
          secret: env("GOOGLE_CLIENT_SECRET"),
          callback: env(
            "GOOGLE_REDIRECT_URI",
            "http://localhost:3000/auth/callback"
          ),
          scope: ["openid", "email", "profile"],
        },
        linkedin: {
          enabled: true,
          icon: "linkedin",
          key: env("LINKEDIN_CLIENT_ID"),
          secret: env("LINKEDIN_CLIENT_SECRET"),
          callback: env(
            "LINKEDIN_REDIRECT_URI",
            "http://localhost:3000/auth/callback"
          ),
          scope: ["openid", "profile", "email"],
          //   scope: ["r_liteprofile", "r_emailaddress"],
        },
      },
    },
  },
  upload: {
    config: {
      breakpoints: {},
    },
  },
});
