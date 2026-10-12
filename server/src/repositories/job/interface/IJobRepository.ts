import { JobSubsetInfo } from "../../../interfaces/interview/interview";
import { IJob } from "../../../models/job/job.model";
import { JobFilters } from "../../../types/jobFilter";
import { BaseRepository } from "../../base/implementation/base.repository";

export interface IJobRepository extends BaseRepository<IJob> {
  getJobs(filter: JobFilters): Promise<any>;
  getJobDetails(id: string): Promise<any>;
  updateStatus(id: string, status: string): Promise<any>;
  findByIdSelect(id: string, fields: string): Promise<JobSubsetInfo | null>;
}
