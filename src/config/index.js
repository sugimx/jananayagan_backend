const dotenv = require("dotenv");

dotenv.config()

const indexConfig = {
  MONGO_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  
  // PhonePe V2 Configuration
  PHONEPE_MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID,
  PHONEPE_CLIENT_ID: process.env.PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET: process.env.PHONEPE_CLIENT_SECRET,
  PHONEPE_CLIENT_VERSION: process.env.PHONEPE_CLIENT_VERSION,
  PHONEPE_BASE_URL: process.env.PHONEPE_BASE_URL,
  
  // Legacy V1 Configuration (deprecated - for reference only)
  PHONEPE_SALT_KEY: process.env.PHONEPE_SALT_KEY,
  PHONEPE_SALT_INDEX: process.env.PHONEPE_SALT_INDEX,
};

module.exports = indexConfig;
