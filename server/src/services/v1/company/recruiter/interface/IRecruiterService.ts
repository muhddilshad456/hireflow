import { JobDto } from "../../../../../dtos/v1/job/job.dto";
import { PaginatedInterviewersResponse } from "../../../../../interfaces/interviewer/interviewer";

export interface IRecruiterService {
  createJob(dto: JobDto, recruiterId: string): Promise<any>;
  updateJob(jobId: string, dto: JobDto, recruiterId: string): Promise<any>;
  aiFilterCandidates(userId: string, jobId: string): Promise<any>;
  getCompanyInterviewers(
    recruiterId: string,
    params: {
      search?: string;
      capability?: string;
      page: number;
      limit: number;
    },
  ): Promise<PaginatedInterviewersResponse>;
}
