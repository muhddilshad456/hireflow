import { Types } from "mongoose";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../../../dependency-injection/types";
import { Logger } from "pino";
import { IMessageRepository } from "../../../../../repositories/chat/message/interface/IMessageRepository";
import { IConversationRepository } from "../../../../../repositories/chat/conversation/interface/IConversationRepository";
import { NotFoundError } from "../../../../../errors/not-found.error";
import { ForbiddenError } from "../../../../../errors/forbidden.error";
import { SenderRole } from "../../../../../interfaces/chat/message";
import { BadRequestError } from "../../../../../errors/bad-request.error";
import { ChatMapper } from "../../../../../mapper/chat/chatMapper";
import { CONVERSATION_MESSAGES } from "../../../../../constants/messages/chat/conversation";
import { MSG_MESSAGES } from "../../../../../constants/messages/chat/msg";
import { ICloudinaryService } from "../../../../cloudinary/interface/ICloudinaryService";
import { IMessageService } from "../interface/IMessageService";
import { IConversation } from "../../../../../models/chat/conversation";
import { IMessage } from "../../../../../models/chat/message";
import { MessageEntity } from "../../../../../interfaces/chat/message";
import { IChatEventPublisher } from "../../../../../events/chat/interface/IChatEventPublisher";
import { UnreadUpdatePayload } from "../../../../../interfaces/chat/conversation";

@injectable()
export class MessageService implements IMessageService {
  constructor(
    @inject(TYPES.MessageRepository)
    private _messageRepository: IMessageRepository,
    @inject(TYPES.ConversationRepository)
    private _conversationRepository: IConversationRepository,
    @inject(TYPES.ChatEventPublisher)
    private _eventPublisher: IChatEventPublisher,
    @inject(TYPES.CloudinaryService)
    private _cloudinaryService: ICloudinaryService,
    @inject(TYPES.Logger)
    private _logger: Logger,
  ) {}
  //* helper
  private async emitUnreadUpdate(
    convo: IConversation,
    receiverId: Types.ObjectId,
  ): Promise<void> {
    try {
      const isRecruiter = convo.recruiterId.equals(receiverId);
      const otherRole: SenderRole = isRecruiter ? "user" : "company_recruiter";
      const [counts, jobUnreadConversations] = await Promise.all([
        this._messageRepository.getUnreadCountsByConversation(
          [convo._id],
          otherRole,
        ),
        isRecruiter
          ? this.getUnreadConversationCountForJob(receiverId, convo.jobId)
          : Promise.resolve(undefined),
      ]);
      const payload: UnreadUpdatePayload = {
        conversationId: convo._id.toString(),
        applicationId: convo.applicationId.toString(),
        jobId: convo.jobId.toString(),
        unreadCount: counts[0]?.count ?? 0,
        jobUnreadConversations,
      };
      this._eventPublisher.publishUnreadUpdate(receiverId.toString(), payload);
    } catch (error) {
      this._logger.warn({
        event: "UNREAD_UPDATE_FAILED",
        conversationId: convo._id,
        error,
      });
    }
  }
  //* security layer
  private async assertActiveParticipant(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<IConversation> {
    const convo = await this._conversationRepository.findById(
      conversationId.toString(),
    );
    if (!convo)
      throw new NotFoundError(CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND);

    const isParticipant =
      convo.recruiterId.equals(userId) || convo.userId.equals(userId);
    if (!isParticipant)
      throw new ForbiddenError(
        CONVERSATION_MESSAGES.CONVERSATION_FORBIDDEN_NOT_PARTICIPANT,
      );

    if (!convo.isActive)
      throw new ForbiddenError(
        CONVERSATION_MESSAGES.CONVERSATION_ALREADY_CLOSED,
      );

    return convo;
  }
  //* send message
  async sendMessage(params: {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderRole: SenderRole;
    content?: string;
    attachment?: Express.Multer.File;
  }): Promise<IMessage> {
    if (!params.content && !params.attachment) {
      throw new BadRequestError(MSG_MESSAGES.MESSAGE_EMPTY);
    }

    const convo = await this.assertActiveParticipant(
      params.conversationId,
      params.senderId,
    );

    let uploadedAttachement;

    if (params.attachment) {
      const url = await this._cloudinaryService.uploadFile(
        params.attachment,
        "message-attachments",
      );
      uploadedAttachement = ChatMapper.toChatAttachmentEntity(
        params.attachment,
        url,
      );
    }

    const entity = ChatMapper.toNewMessageEntity({
      ...params,
      attachment: uploadedAttachement,
    });
    const message = await this._messageRepository.create(entity);

    await this._conversationRepository.updateLastMessage(
      params.conversationId,
      params.content?.slice(0, 100) ?? "📎 Attachment",
      message.createdAt ?? new Date(),
    );

    this._eventPublisher.publishNewMessage(
      params.conversationId.toString(),
      message,
    );

    const recipientId = convo.recruiterId.equals(params.senderId)
      ? convo.userId
      : convo.recruiterId;
    await this.emitUnreadUpdate(convo, recipientId);

    this._logger.info({
      event: "MESSAGE_SENT",
      conversationId: params.conversationId,
      senderId: params.senderId,
      messageId: message._id,
    });

    return message;
  }
  //* get messages
  async getMessages(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
    cursor?: string,
    limit = 30,
  ): Promise<MessageEntity[]> {
    await this.assertActiveParticipant(conversationId, userId);
    const cursorId = cursor ? new Types.ObjectId(cursor) : undefined;
    return this._messageRepository.findByConversation(
      conversationId,
      cursorId,
      limit,
    );
  }
  //* mark as read
  async markAsRead(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const convo = await this.assertActiveParticipant(conversationId, userId);
    await this._messageRepository.markReadByRecipient(conversationId, userId);
    this._logger.info({
      event: "MESSAGES_MARKED_READ",
      conversationId,
      userId,
    });
    await this.emitUnreadUpdate(convo, userId);
  }

  async getUnreadConversationCountForJob(
    recruiterId: Types.ObjectId,
    jobId: Types.ObjectId,
  ): Promise<number> {
    const ids =
      await this._conversationRepository.findActiveIdsByRecruiterAndJob(
        recruiterId,
        jobId,
      );
    if (ids.length === 0) return 0;
    const counts = await this._messageRepository.getUnreadCountsByConversation(
      ids,
      "user",
    );
    return counts.length;
  }

  async getUnreadCountForApplication(
    userId: Types.ObjectId,
    applicationId: Types.ObjectId,
  ): Promise<number> {
    const id =
      await this._conversationRepository.findActiveIdByApplicationAndUser(
        applicationId,
        userId,
      );
    if (!id) return 0;
    const counts = await this._messageRepository.getUnreadCountsByConversation(
      [id],
      "company_recruiter",
    );
    return counts[0]?.count ?? 0;
  }
}
