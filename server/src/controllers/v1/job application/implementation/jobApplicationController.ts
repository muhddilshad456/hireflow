import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";
import { inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IJobService } from "../../../../services/v1/job/interface/IJobService";
import { IJobApplicationController } from "../interface/IJobApplicationController";
import { IJobApplicationService } from "../../../../services/v1/job application/interface/IJobApplicationService";
import { APPLICATION_MESSAGES } from "../../../../constants/messages/application";

export class JobApplicationController implements IJobApplicationController {
  constructor(
    @inject(TYPES.JobService) private jobService: IJobService,
    @inject(TYPES.JobApplicationService)
    private jobApplicationService: IJobApplicationService,
  ) {}
  //* get my applications
  async getMyApplications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };
      const userId = req?.user?.userId;

      const result = await this.jobApplicationService.getMyApplications(
        filters,
        userId,
      );
      ResponseHandler.success(res, JOB_MESSAGES.JOBS_FETCHED, result);
    } catch (error) {
      next(error);
    }
  }
  //* get application
  async getMyApplicationDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const applicationId = req.params.applicationId as string;
      const userId = req?.user?.userId;

      const result = await this.jobApplicationService.getMyApplicationDetails(
        applicationId,
        userId,
      );
      ResponseHandler.success(res, JOB_MESSAGES.JOB_FETCHED, result);
    } catch (error) {
      next(error);
    }
  }
  //* update applicaiton stage
  async updateApplicationStage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const appStageId = req.params.appStageId as string;
      const { decision, feedback } = req.body;
      const recruiterId = req.user.userId;

      console.log("Application stage Id : ", appStageId);
      console.log("decision : ", decision);
      console.log("recruiter Id : ", recruiterId);

      const result = await this.jobApplicationService.updateApplicationStage(
        appStageId,
        decision,
        feedback,
        recruiterId,
      );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.APPLICATION_STAGE_UPDATED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* move to next stage (bulk)
  async moveMultipleToNextStage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { applicationIds, feedback } = req.body as {
        applicationIds: string[];
        feedback?: string;
      };

      const result = await this.jobApplicationService.moveMultipleToNextStage(
        applicationIds,
        feedback,
      );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.STAGE_UPDATE_SUCCESSFULLY,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get application stage details
  async getJobApplicationStageDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { applicationId, jobStageId } = req.params;

      const result =
        await this.jobApplicationService.getJobApplicationStageDetails(
          userId,
          applicationId as string,
          jobStageId as string,
        );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.APPLICATION_STAGE_FETCH_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* add or edit assessment resonce
  async addOrEditAssessmentResponse(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { applicationId, jobStageId } = req.params;
      const { text } = req.body;
      const file = req.file;

      const result =
        await this.jobApplicationService.addOrEditAssessmentResponse(
          userId,
          applicationId as string,
          jobStageId as string,
          text,
          file,
        );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.RESPONSE_SAVED_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
