import { Request, Response, NextFunction } from "express";
import { inject } from "inversify";
import { TYPES } from "../../../../../dependency-injection/types";
import { IInterviewerController } from "../interface/IInterviewerController";
import { IInterviewerService } from "../../../../../services/v1/company/interviewer/interface/IInterviewerService";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";
import { ResponseHandler } from "../../../../../utils/responseHandler";
import { INTERVIEWER_MESSAGES } from "../../../../../constants/messages/company/interviewer/interviewer";
import { INTERVIEW_REQUEST_MESSAGES } from "../../../../../constants/messages/interview/interview-request";
import { InterviewRequestDecisionDto } from "../../../../../dtos/v1/interview/interviewRequestDecisionDto";
import { INTERVIEW_MESSAGES } from "../../../../../constants/messages/interview/interview";

export class InterviewerController implements IInterviewerController {
  constructor(
    @inject(TYPES.InterviewerService)
    private interviewerService: IInterviewerService,
  ) {}
  //* toggle availability
  async toggleAvailability(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { isAvailable } = req.body;
      const result = await this.interviewerService.toggleAvailability(
        userId,
        isAvailable,
      );
      ResponseHandler.success(
        res,
        INTERVIEWER_MESSAGES.AVAILABILITY_UPDATED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* update interviewer profile (bio and capabilities)
  async updateInterviewerProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const dto = req.body;
      const result = await this.interviewerService.updateInterviewerProfile(
        userId,
        dto,
      );
      ResponseHandler.success(
        res,
        INTERVIEWER_MESSAGES.PROFILE_UPDATED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get interviewer profile
  async getInterviewerProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result =
        await this.interviewerService.getInterviewerProfile(userId);
      ResponseHandler.success(
        res,
        INTERVIEWER_MESSAGES.PROFILE_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get interview requests
  async getInterviewRequests(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { status, page, limit } = req.query;

      const result = await this.interviewerService.getInterviewRequests(
        userId,
        {
          status: status as string | undefined,
          page: Number(page) || 1,
          limit: Number(limit) || 10,
        },
      );

      ResponseHandler.success(
        res,
        INTERVIEW_REQUEST_MESSAGES.INTERVIEW_REQUESTS_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* update interviewe req decision
  async updateIntReqDecision(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const requestId = req.params.id as string;
      const dto: InterviewRequestDecisionDto = req.body;

      const result = await this.interviewerService.updateIntReqDecision(
        requestId,
        dto,
        userId,
      );

      ResponseHandler.success(
        res,
        INTERVIEW_REQUEST_MESSAGES.DECISION_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get interviews
  async getInterviews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { search, status, page, limit } = req.query;

      const result = await this.interviewerService.getInterviews(userId, {
        search: search as string,
        status: status as string | undefined,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      ResponseHandler.success(
        res,
        INTERVIEW_MESSAGES.INTERVIEWS_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
