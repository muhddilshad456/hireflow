import { injectable, inject } from "inversify";
import { AuthUser } from "../../../../types/AuthUser";
import { JobFilters } from "../../../../types/jobFilter";
import { IJobService } from "../interface/IJobService";
import { TYPES } from "../../../../dependency-injection/types";
import { IJobRepository } from "../../../../repositories/job/interface/IJobRepository";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";

@injectable()
export class JobService implements IJobService {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
  ) {}
  //* get all jobs
  async getJobs(filter: JobFilters, user: AuthUser): Promise<any> {
    console.log("filter for getJobs : ", filter);
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
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    const result = await this.jobRepository.findById(jobId);
    return result;
  }
}
