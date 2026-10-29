import { Server } from "socket.io";

import { AuthedSocket, socketAuth } from "./middleware/socketAuth";

import { initChatSocket } from "./chat/chatSocket";
import { initInterviewSocket } from "./interview/interviewSocket";
import { setIO } from "./Socketserver";
import { initNotificationSocket } from "./notification/notificationSocket";

export function initSocket(io: Server) {
  io.use(socketAuth);
  io.on("connection", (socket: AuthedSocket) => {
    console.log("User connected:", socket.id, socket.user?.id);

    setIO(io);
    // chat
    initChatSocket(socket);
    // Interview / WebRTC
    initInterviewSocket(io, socket);
    // Notification
    initNotificationSocket(socket);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}`, reason);
    });
  });
}
