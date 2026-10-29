import { JobSubsetInfo } from "../../../interfaces/interview/interview";
import { IJob } from "../../../models/job/job.model";
import { JobFilters } from "../../../types/jobFilter";
import { BaseRepository } from "../../base/implementation/base.repository";

export interface PaginatedJobsResult {
  data: IJob[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IJobRepository extends BaseRepository<IJob> {
  getJobs(filter: JobFilters): Promise<PaginatedJobsResult>;
  getJobDetails(id: string): Promise<IJob | null>;
  updateStatus(id: string, status: string): Promise<void>;
  findByIdSelect(id: string, fields: string): Promise<JobSubsetInfo | null>;
}
