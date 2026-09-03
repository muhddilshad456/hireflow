import http from "http";
import dotenv from "dotenv";
dotenv.config();

import { logger } from "./utils/logger.util";
import app from "./app";
import { connectDB } from "./config/db";
import { initializeSocket } from "./socket/socket";
import { initChatSocket } from "./socket/chat.socket";
import { bindSocketDependencies } from "./dependency-injection/container";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  const server = http.createServer(app);
  const io = initializeSocket(server);

  bindSocketDependencies(io);

  initChatSocket(io);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error({ event: "SERVER_BOOTSTRAP_FAILED", error: err.message });
  process.exit(1);
});
