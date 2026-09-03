import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { VALIDATION_MESSAGES } from "../constants/messages/validation";
import { IConversationService } from "../services/v1/chat/conversation/interface/IConversationService";
import { IMessageService } from "../services/v1/chat/message/interface/IMessageService";
import { TYPES } from "../dependency-injection/types";
import { container } from "../dependency-injection/container";

interface AuthedSocket extends Socket {
  user?: { id: string; role: "company_recruiter" | "user" };
}

export function initChatSocket(io: Server) {
  io.use((socket: AuthedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized: Token missing"));
      }
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
      socket.user = { id: payload.userId, role: payload.role };
      next();
    } catch (error) {
      console.error("❌ Socket authentication failed:", error);
      next(new Error(VALIDATION_MESSAGES.UNAUTHORIZED));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    console.log("User connected:", socket.id);
    const conversationService = container.get<IConversationService>(
      TYPES.ConversationService,
    );
    const messageService = container.get<IMessageService>(TYPES.MessageService);
    socket.on("conversation:join", async (conversationId: string) => {
      const allowed = await conversationService.isParticipant(
        new Types.ObjectId(conversationId),
        new Types.ObjectId(socket.user!.id),
      );
      if (!allowed) return socket.emit("error", { message: "FORBIDDEN" });
      socket.join(conversationId);
    });

    socket.on("conversation:leave", (conversationId: string) =>
      socket.leave(conversationId),
    );

    socket.on(
      "message:send",
      async (data: { conversationId: string; content: string }) => {
        try {
          const message = await messageService.sendMessage({
            conversationId: new Types.ObjectId(data.conversationId),
            senderId: new Types.ObjectId(socket.user!.id),
            senderRole: socket.user!.role,
            content: data.content,
          });
        } catch (err: any) {
          socket.emit("error", { message: err.message });
        }
      },
    );

    socket.on(
      "typing",
      (data: { conversationId: string; isTyping: boolean }) => {
        socket
          .to(data.conversationId)
          .emit("typing", { userId: socket.user!.id, isTyping: data.isTyping });
      },
    );
  });
}
