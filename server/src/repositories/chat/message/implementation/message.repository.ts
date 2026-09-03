import { Types } from "mongoose";
import { MessageEntity } from "../../../../interfaces/chat/message";
import { IMessage, MessageModel } from "../../../../models/chat/message";
import { BaseRepository } from "../../../base/implementation/base.repository";
import { IMessageRepository } from "../interface/IMessageRepository";
import { injectable } from "inversify";

@injectable()
export class MessageRepository
  extends BaseRepository<IMessage>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  async findByConversation(
    conversationId: Types.ObjectId,
    cursor?: Types.ObjectId,
    limit = 30,
  ): Promise<MessageEntity[]> {
    const query: any = { conversationId };
    if (cursor) query._id = { $lt: cursor };
    return MessageModel.find(query).sort({ _id: 1 }).limit(limit).lean();
  }

  async markReadByRecipient(
    conversationId: Types.ObjectId,
    recipientId: Types.ObjectId,
  ): Promise<void> {
    await MessageModel.updateMany(
      { conversationId, senderId: { $ne: recipientId }, isRead: false },
      { $set: { isRead: true } },
    );
  }
}
