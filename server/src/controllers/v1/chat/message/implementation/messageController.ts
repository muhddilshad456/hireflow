import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import { IMessageController } from "../interface/IMessageController";
import { TYPES } from "../../../../../dependency-injection/types";
import { ResponseHandler } from "../../../../../utils/responseHandler";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";
import { MSG_MESSAGES } from "../../../../../constants/messages/chat/msg";
import { IMessageService } from "../../../../../services/v1/chat/message/interface/IMessageService";

@injectable()
export class MessageController implements IMessageController {
  constructor(
    @inject(TYPES.MessageService) private messageService: IMessageService,
  ) {}
  //* send message
  async sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const conversationId = new Types.ObjectId(req.params.id as string);
      const attachment = req.file;

      const message = await this.messageService.sendMessage({
        conversationId,
        senderId: new Types.ObjectId(req.user!.userId),
        senderRole: req.user!.role,
        content: req.body.content,
        attachment,
      });

      ResponseHandler.success(res, MSG_MESSAGES.MESSAGE_SENT, message, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const conversationId = req.params.id as string;
      const messages = await this.messageService.getMessages(
        new Types.ObjectId(conversationId),
        new Types.ObjectId(req.user!.userId),
        req.query.cursor as string | undefined,
      );
      ResponseHandler.success(res, MSG_MESSAGES.MESSAGE_FETCHED, messages);
    } catch (error) {
      next(error);
    }
  }

  async markRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const conversationId = req.params.id as string;
      await this.messageService.markAsRead(
        new Types.ObjectId(conversationId),
        new Types.ObjectId(req.user!.userId),
      );
      ResponseHandler.success(res, MSG_MESSAGES.MESSAGE_MARKED_READ, {});
    } catch (error) {
      next(error);
    }
  }
}
