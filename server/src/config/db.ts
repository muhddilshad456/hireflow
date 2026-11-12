import mongoose from "mongoose";
import { logger } from "../utils/logger.util";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    logger.info("MongoDB connected..");
  } catch (error: unknown) {
    logger.error(error, "MongoDB connection failed.");
    process.exit(1);
  }
};
