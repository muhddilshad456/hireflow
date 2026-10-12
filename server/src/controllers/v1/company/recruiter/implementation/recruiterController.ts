import { Request, Response, NextFunction } from "express";
import { IRecruiterController } from "../interface/IRecruiterController";
import { inject } from "inversify";
import { TYPES } from "../../../../../dependency-injection/types";
import { IRecruiterService } from "../../../../../services/v1/company/recruiter/interface/IRecruiterService";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";
import { ResponseHandler } from "../../../../../utils/responseHandler";
import { JOB_MESSAGES } from "../../../../../constants/messages/jobs";
import { AI_SCREENING_MESSAGES } from "../../../../../constants/messages/ai-screening-messages";
import { INTERVIEWER_MESSAGES } from "../../../../../constants/messages/company/interviewer/interviewer";

export class RecruiterController implements IRecruiterController {
  constructor(
    @inject(TYPES.RecruiterService) private recruiterService: IRecruiterService,
  ) {}
  //* create job
  async createJob(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = req.body;
      const recruiterId = req.user?.userId;
      const result = await this.recruiterService.createJob(dto, recruiterId);
      ResponseHandler.success(res, JOB_MESSAGES.JOB_CREATED, result);
    } catch (error) {
      next(error);
    }
  }
  //* update job
  async updateJob(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = req.body;
      const jobId = req.params.jobId as string;
      const recruiterId = req.user?.userId;
      const result = await this.recruiterService.updateJob(
        jobId,
        dto,
        recruiterId,
      );
      ResponseHandler.success(res, JOB_MESSAGES.JOB_UPDATED, result);
    } catch (error) {
      next(error);
    }
  }
  //* AI filter candidates
  async aiFilterCandidates(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = req?.params?.jobId as string;
      const userId = req?.user?.userId;
      const result = await this.recruiterService.aiFilterCandidates(
        userId,
        jobId,
      );
      ResponseHandler.success(
        res,
        AI_SCREENING_MESSAGES.CANDIDATES_FILTERED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get interviewers of a company
  async getCompanyInterviewers(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recruiterId = req.user?.userId;
      const { search, capability, page, limit } = req.query;

      const result = await this.recruiterService.getCompanyInterviewers(
        recruiterId,
        {
          search: search as string | undefined,
          capability: capability as string | undefined,
          page: Number(page) || 1,
          limit: Number(limit) || 10,
        },
      );

      ResponseHandler.success(
        res,
        INTERVIEWER_MESSAGES.AVAILABLE_INTERVIEWERS_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
