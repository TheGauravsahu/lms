import mongoose from "mongoose";
import env from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB ✅");

    // Drop outdated purchase index if it exists
    try {
      await mongoose.connection.db.collection("purchases").dropIndex("user_id_1_course_id_1");
      console.log("Dropped outdated index user_id_1_course_id_1 successfully.");
    } catch (err) {
      // index does not exist, ignore
    }
  } catch (e) {
    console.error("Error connecting to MongoDB:", e);
    process.exit(1);
  }
};
