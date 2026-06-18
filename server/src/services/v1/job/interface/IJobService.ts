import { AuthUser } from "../../../../types/AuthUser";
import { JobFilters } from "../../../../types/jobFilter";

export interface IJobService {
  getJobs(filter: JobFilters, user: AuthUser): Promise<any>;
  getJob(jobId: string): Promise<any>;
  updateStatus(jobId: string, status: string): Promise<any>;
}
