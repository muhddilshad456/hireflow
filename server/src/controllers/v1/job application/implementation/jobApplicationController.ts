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
  //* move to next stage
  async moveToNextStage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const applicationId = req.params.applicationId as string;

      const feedback = req?.body?.feedback;

      const result = await this.jobApplicationService.moveToNextStage(
        applicationId,
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
}
