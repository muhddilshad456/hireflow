import { Types } from "mongoose";
import { MessageEntity, SenderRole } from "../../../../../interfaces/chat/message";
import { IMessage } from "../../../../../models/chat/message";

export interface IMessageService {
  sendMessage(params: {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderRole: SenderRole;
    content?: string;
    attachment?: Express.Multer.File;
  }): Promise<IMessage>;
  getMessages(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
    cursor?: string,
    limit?: number,
  ): Promise<MessageEntity[]>;
  markAsRead(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void>;
}
