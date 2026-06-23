import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log(
      "Attempting to connect with URI:",
      env.MONGO_URI ? "URI exists" : "URI IS UNDEFINED",
    );
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();
