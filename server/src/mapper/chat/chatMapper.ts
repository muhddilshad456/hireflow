import { Types } from "mongoose";
import type {
  ConversationEntity,
  CreatorRole,
} from "../../interfaces/chat/conversation";
import { MessageEntity, SenderRole } from "../../interfaces/chat/message";
import { IFile } from "../../interfaces/file/file";

export class ChatMapper {
  static toNewConversationEntity(params: {
    applicationId: Types.ObjectId;
    jobId: Types.ObjectId;
    recruiterId: Types.ObjectId;
    userId: Types.ObjectId;
    createdBy: CreatorRole;
  }): ConversationEntity {
    return {
      applicationId: params.applicationId,
      jobId: params.jobId,
      recruiterId: params.recruiterId,
      userId: params.userId,
      createdBy: params.createdBy,
      isActive: true,
    };
  }

  static toChatAttachmentEntity(file: Express.Multer.File, url: string) {
    return {
      url,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    };
  }

  static toNewMessageEntity(params: {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderRole: SenderRole;
    content?: string;
    attachment?: IFile;
  }): MessageEntity {
    return {
      conversationId: params.conversationId,
      senderId: params.senderId,
      senderRole: params.senderRole,
      content: params.content,
      attachment: params.attachment,
      isRead: false,
    };
  }
}
