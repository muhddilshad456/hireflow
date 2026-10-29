import { JobDto } from "../../../../../dtos/v1/job/job.dto";
import { IJob } from "../../../../../models/job/job.model";
import { RankedCandidateDto } from "../../../../../interfaces/ai-filter/ai-responce";
import { PaginatedInterviewersResponse } from "../../../../../interfaces/interviewer/interviewer";
import {
  RecruiterDashboard,
  RecruiterProfileResponse,
} from "../../../../../interfaces/company/recruiter/recruiter";

export interface IRecruiterService {
  createJob(dto: JobDto, recruiterId: string): Promise<IJob>;
  updateJob(jobId: string, dto: JobDto, recruiterId: string): Promise<IJob>;
  aiFilterCandidates(
    userId: string,
    jobId: string,
  ): Promise<RankedCandidateDto[]>;
  getCompanyInterviewers(
    recruiterId: string,
    params: {
      search?: string;
      capability?: string;
      page: number;
      limit: number;
    },
  ): Promise<PaginatedInterviewersResponse>;
  getRecruiterProfile(userId: string): Promise<RecruiterProfileResponse>;
  getDashboard(recruiterId: string): Promise<RecruiterDashboard>;
}
