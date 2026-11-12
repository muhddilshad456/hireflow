import { injectable, inject } from "inversify";
import { Server } from "socket.io";
import { TYPES } from "../../../dependency-injection/types";
import { IChatEventPublisher } from "../interface/IChatEventPublisher";
import { MessageEntity } from "../../../interfaces/chat/message";
import { UnreadUpdatePayload } from "../../../interfaces/chat/conversation";
import { userRoom } from "../../../constants/notification/notification";

@injectable()
export class SocketChatEventPublisher implements IChatEventPublisher {
  constructor(@inject(TYPES.SocketIO) private readonly io: Server) {}

  publishNewMessage(conversationId: string, message: MessageEntity): void {
    this.io.to(conversationId).emit("message:new", message);
  }
  publishUnreadUpdate(userId: string, payload: UnreadUpdatePayload): void {
    this.io.to(userRoom(userId)).emit("chat:unread", payload);
  }
}
