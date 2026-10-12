import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";
import { inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IInterviewController } from "../interface/IInterviewController";
import { IInterviewService } from "../../../../services/v1/interview/interface/IInterviewService";
import { INTERVIEW_REQUEST_MESSAGES } from "../../../../constants/messages/interview/interview-request";
import { INTERVIEW_MESSAGES } from "../../../../constants/messages/interview/interview";

export class InterviewController implements IInterviewController {
  constructor(
    @inject(TYPES.InterviewService) private interviewService: IInterviewService,
  ) {}
  //* create interview request
  async createInterviewRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recruiterId = req.user.userId;
      const data = req.body;
      const result = await this.interviewService.createInterviewRequest(
        recruiterId,
        data,
      );
      ResponseHandler.success(
        res,
        INTERVIEW_REQUEST_MESSAGES.INTERVIEW_REQUEST_CREATED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get interview details
  async getInterviewDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user.userId;
      const interviewId = req.params.id;
      const result = await this.interviewService.getInterviewDetails(
        userId,
        interviewId as string,
      );
      ResponseHandler.success(
        res,
        INTERVIEW_MESSAGES.INTERVIEW_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* submit feedback
  async submitFeedback(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user.userId;
      const interviewId = req.params.id;
      const dto = req?.body;
      const result = await this.interviewService.submitFeedback(
        userId,
        interviewId as string,
        dto,
      );
      ResponseHandler.success(
        res,
        INTERVIEW_MESSAGES.FEEDBACK_SAVED_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
