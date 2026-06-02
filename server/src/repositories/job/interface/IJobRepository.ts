import { IJob } from "../../../models/job.model";
import { JobFilters } from "../../../types/jobFilter";
import { BaseRepository } from "../../base/implementation/base.repository";

export interface IJobRepository extends BaseRepository<IJob> {
  getJobs(filter: JobFilters): Promise<any>;
}
