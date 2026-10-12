import { Server } from "socket.io";

import { AuthedSocket, socketAuth } from "./middleware/socketAuth";

import { initChatSocket } from "./chat/chatSocket";
import { initInterviewSocket } from "./interview/interviewSocket";

export function initSocket(io: Server) {
  io.use(socketAuth);
  io.on("connection", (socket: AuthedSocket) => {
    console.log("User connected:", socket.id, socket.user?.id);
    // chat
    initChatSocket(socket);
    // Interview / WebRTC
    initInterviewSocket(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}`, reason);
    });
  });
}
