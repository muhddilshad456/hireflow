import { AuthUser } from "../../../../types/AuthUser";
import { JobFilters } from "../../../../types/jobFilter";

export interface IJobService {
  getJobs(filter: JobFilters, user: AuthUser): Promise<any>;
  getJob(jobId: string): Promise<any>;
  updateStatus(jobId: string, status: string): Promise<any>;
  applyJob(userId: string, jobId: string, data: any): Promise<any>;
  getJobWithDetails(jobId: string): Promise<any>;
  getStageCandidates(
    jobId: string,
    stageId: string,
    params: { search?: string; status?: string; page: number; limit: number },
  ): Promise<any>;
}
