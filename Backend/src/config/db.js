const mongoose = require("mongoose");

const connectDB = async () => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const connection = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`MongoDB connected: ${connection.connection.host}`);
      return connection;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/5 failed: ${error.message}`);
      if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  console.error("MongoDB connection failed after 5 attempts. Check Atlas network access, DNS, and credentials.");
  process.exit(1);
};

module.exports = connectDB;