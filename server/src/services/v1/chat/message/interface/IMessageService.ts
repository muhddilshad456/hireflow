import { Types } from "mongoose";
import { SenderRole } from "../../../../../interfaces/chat/message";

export interface IMessageService {
  sendMessage(params: {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderRole: SenderRole;
    content?: string;
    attachment?: Express.Multer.File;
  }): Promise<any>;
  getMessages(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
    cursor?: string,
    limit?: Number,
  ): Promise<any>;
  markAsRead(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<any>;
}
