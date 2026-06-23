import "dotenv/config";

export default {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_TOKEN: process.env.REDIS_TOKEN,
  LMS_CLIENT_URL: process.env.LMS_CLIENT_URL || "",
};
