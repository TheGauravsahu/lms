import "dotenv/config";

export default {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/lms",
  JWT_SECRET: process.env.JWT_SECRET,
};
