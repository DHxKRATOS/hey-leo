require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'leo-strapi',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 1337,
        APP_KEYS: process.env.APP_KEYS,
        API_TOKEN_SALT: process.env.API_TOKEN_SALT,
        ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
        TRANSFER_TOKEN_SALT: process.env.TRANSFER_TOKEN_SALT,
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_CLIENT: 'mysql',
        DATABASE_HOST: process.env.DATABASE_HOST || '127.0.0.1',
        DATABASE_PORT: process.env.DATABASE_PORT || 3306,
        DATABASE_NAME: process.env.DATABASE_NAME || 'leodb',
        DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'leo',
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'Root@1234',
        DATABASE_SSL: process.env.DATABASE_SSL || 'false',
      },
    },
  ],
};
