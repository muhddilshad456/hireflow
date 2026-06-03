import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { IJobController } from "../interface/IJobController";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";
import { inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IJobService } from "../../../../services/v1/job/interface/IJobService";

export class JobController implements IJobController {
  constructor(@inject(TYPES.JobService) private jobService: IJobService) {}
  //* get jobs
  async getJobs(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters = {
        jobType: req.query.jobType as string[] | [],
        location: req.query.location as string | undefined,
        category: req.query.category as string[] | [],
        salaryMin: req.query.salaryMin as string | undefined,
        salaryMax: req.query.salaryMax as string | undefined,
        experienceMin: req.query.experienceMin as string | undefined,
        experienceMax: req.query.experienceMax as string | undefined,
        search: req.query.search as string | undefined,
        isActive: req.query.isActive as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        createdBy: req.query.createdBy as string | undefined,
      };
      const user = req?.user;

      const result = await this.jobService.getJobs(filters, user);
      ResponseHandler.success(res, JOB_MESSAGES.JOBS_FETCHED, result);
    } catch (error) {
      next(error);
    }
  }
  //* get job by id
  async getJob(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = req.params.id as string;
      const result = await this.jobService.getJob(jobId);
      ResponseHandler.success(res, JOB_MESSAGES.JOB_FETCHED, result);
    } catch (error) {
      next(error);
    }
  }
}
