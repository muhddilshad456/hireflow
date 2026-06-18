import { injectable, inject } from "inversify";
import { AuthUser } from "../../../../types/AuthUser";
import { JobFilters } from "../../../../types/jobFilter";
import { IJobService } from "../interface/IJobService";
import { TYPES } from "../../../../dependency-injection/types";
import { IJobRepository } from "../../../../repositories/job/interface/IJobRepository";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { Logger } from "pino";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";

@injectable()
export class JobService implements IJobService {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}
  //* get all jobs
  async getJobs(filter: JobFilters, user: AuthUser): Promise<any> {
    const query: JobFilters = { ...filter };

    if (user?.role == "company_recruiter") {
      query.createdBy = user?.userId;
    }

    const result = await this.jobRepository.getJobs(query);

    return result;
  }
  //* get a job
  async getJob(jobId: string): Promise<any> {
    if (!jobId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    const result = await this.jobRepository.getJobDetails(jobId);
    return result;
  }
  //* update status
  async updateStatus(jobId: string, status: string): Promise<any> {
    if (!jobId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    if (!status) {
      this.logger.warn({
        event: JOB_MESSAGES.JOB_STATUS_REQUIRED,
        jobId,
      });
      throw new BadRequestError(JOB_MESSAGES.JOB_STATUS_REQUIRED);
    }
    await this.jobRepository.updateStatus(jobId, status);
  }
}
