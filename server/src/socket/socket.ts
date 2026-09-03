import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export const initializeSocket = (server: HttpServer) => {
  return new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
};
