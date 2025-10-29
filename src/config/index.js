const dotenv = require("dotenv");

dotenv.config()

const indexConfig = {
  MONGO_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  PHONEPE_MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID,
  PHONEPE_SALT_KEY: process.env.PHONEPE_SALT_KEY,
  PHONEPE_SALT_INDEX: process.env.PHONEPE_SALT_INDEX,
  PHONEPE_BASE_URL: process.env.PHONEPE_BASE_URL,
};

module.exports = indexConfig;
