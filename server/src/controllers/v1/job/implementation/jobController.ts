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
        isActive: req.query.status as string | undefined,
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
  //* update status
  async updateStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = req.params.id as string;
      const status = req.body.status;
      await this.jobService.updateStatus(jobId, status);
      ResponseHandler.success(res, JOB_MESSAGES.JOB_UPDATED);
    } catch (error) {
      next(error);
    }
  }
  //* apply job
  async applyJob(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const jobId = req.params.jobId as string;
      const data = req.body.data;
      const result = await this.jobService.applyJob(userId, jobId, data);
      ResponseHandler.success(res, JOB_MESSAGES.JOB_APPLIED_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
  //* get a job with full datails
  async getJobDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const data = await this.jobService.getJobWithDetails(jobId);
      ResponseHandler.success(res, JOB_MESSAGES.JOB_FETCHED, data);
    } catch (error) {
      next(error);
    }
  }
  //* get candidates in each stages of the job
  async getStageCandidates(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const stageId = req.params.stageId as string;
      const { search, status, page = "1", limit = "6" } = req.query;

      const data = await this.jobService.getStageCandidates(jobId, stageId, {
        search: search as string | undefined,
        status: status as string | undefined,
        page: Number(page),
        limit: Number(limit),
      });

      ResponseHandler.success(res, JOB_MESSAGES.STAGE_CANDIDATES_FETCHED, data);
    } catch (error) {
      next(error);
    }
  }
  //* add assesement stage task
  async addAssesmentTask(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const stageId = req.params.stageId as string;
      const description = req.body.description;
      const file = req.file;

      const data = await this.jobService.addAssesmentTask(
        jobId,
        stageId,
        description,
        file,
      );

      ResponseHandler.success(
        res,
        JOB_MESSAGES.ASSESMENT_TASK_ADDED_SUCCESSFULLY,
        data,
      );
    } catch (error) {
      next(error);
    }
  }
}
