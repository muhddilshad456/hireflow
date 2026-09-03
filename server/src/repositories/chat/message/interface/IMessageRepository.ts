import { Types } from "mongoose";
import { IMessage } from "../../../../models/chat/message";
import { IBaseRepository } from "../../../base/interface/IBaseRepository";
import { MessageEntity } from "../../../../interfaces/chat/message";

export interface IMessageRepository extends IBaseRepository<IMessage> {
  findByConversation(
    conversationId: Types.ObjectId,
    cursor?: Types.ObjectId,
    limit?: Number,
  ): Promise<MessageEntity[]>;
  markReadByRecipient(
    conversationId: Types.ObjectId,
    recipientId: Types.ObjectId,
  ): Promise<void>;
}
