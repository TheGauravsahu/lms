import mongoose from "mongoose";
import env from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB ✅");
  } catch (e) {
    console.error("Error connecting to MongoDB:", e);
    process.exit(1);
  }
};
