import dotenv from "dotenv";
dotenv.config();
import { logger } from "./utils/logger.util";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`server running on port ${PORT}`);
  });
});
