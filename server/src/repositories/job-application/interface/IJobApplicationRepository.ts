import { PipelineStage } from "mongoose";
import { IJobApplication } from "../../../models/job-application/job.application.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface IJobApplicationRepository extends IBaseRepository<IJobApplication> {
  getMyApplicationsAggregate<T = unknown>(
    pipeline: PipelineStage[],
  ): Promise<T[]>;
  findByUserAndJobIds(
    userId: string,
    jobIds: string[],
  ): Promise<Pick<IJobApplication, "_id" | "jobId" | "status" | "appliedAt">[]>;
}

export interface AggregateFacetResult<T = unknown> {
  data: T[];
  totalCount: { count: number }[];
}
