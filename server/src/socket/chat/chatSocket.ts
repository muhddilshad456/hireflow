import { Types } from "mongoose";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { IConversationService } from "../../services/v1/chat/conversation/interface/IConversationService";
import { IMessageService } from "../../services/v1/chat/message/interface/IMessageService";
import { AuthedSocket } from "../middleware/socketAuth";
import { SenderRole } from "../../interfaces/chat/message";

export function initChatSocket(socket: AuthedSocket) {
  const conversationService = container.get<IConversationService>(
    TYPES.ConversationService,
  );

  const messageService = container.get<IMessageService>(TYPES.MessageService);

  socket.on("conversation:join", async (conversationId: string) => {
    try {
      const allowed = await conversationService.isParticipant(
        new Types.ObjectId(conversationId),
        new Types.ObjectId(socket.user!.id),
      );

      if (!allowed) {
        return socket.emit("error", {
          message: "FORBIDDEN",
        });
      }

      socket.join(conversationId);
    } catch (error: any) {
      socket.emit("error", {
        message: error.message,
      });
    }
  });

  socket.on("conversation:leave", (conversationId: string) => {
    socket.leave(conversationId);
  });

  socket.on(
    "message:send",
    async (data: { conversationId: string; content: string }) => {
      try {
        await messageService.sendMessage({
          conversationId: new Types.ObjectId(data.conversationId),
          senderId: new Types.ObjectId(socket.user!.id),
          senderRole: socket.user!.role as SenderRole,
          content: data.content,
        });
      } catch (err: any) {
        socket.emit("error", {
          message: err.message,
        });
      }
    },
  );

  socket.on("typing", (data: { conversationId: string; isTyping: boolean }) => {
    socket.to(data.conversationId).emit("typing", {
      userId: socket.user!.id,
      isTyping: data.isTyping,
    });
  });
}
