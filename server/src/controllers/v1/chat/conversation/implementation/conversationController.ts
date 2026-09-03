import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { IConversationController } from "../interface/IConversationController";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../../../dependency-injection/types";
import { IConversationService } from "../../../../../services/v1/chat/conversation/interface/IConversationService";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";
import { ResponseHandler } from "../../../../../utils/responseHandler";

@injectable()
export class ConversationController implements IConversationController {
  constructor(
    @inject(TYPES.ConversationService)
    private conversationService: IConversationService,
  ) {}
  //* create or get conversation
  async createOrGet(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log("🚀 CREATE CONVERSATION API HIT");
      const { applicationId } = req.body;
      const conversation =
        await this.conversationService.getOrCreateConversation(
          new Types.ObjectId(applicationId),
          new Types.ObjectId(req.user!.userId),
          req.user!.role,
        );
      ResponseHandler.success(res, "Conversation ready", conversation);
    } catch (error: any) {
      console.log(error);
      next(error);
    }
  }
  //* list conversation
  async list(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = req.params.jobId as string;

      const conversations = await this.conversationService.listConversations(
        new Types.ObjectId(req.user!.userId),
        req.user!.role,
        new Types.ObjectId(jobId),
      );
      ResponseHandler.success(res, "Conversations fetched", conversations);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
