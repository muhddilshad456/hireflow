import { PipelineStage } from "mongoose";
import { IJobApplication } from "../../../models/job-application/job.application.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface IJobApplicationRepository extends IBaseRepository<IJobApplication> {
  getMyApplicationsAggregate<T = unknown>(
    pipeline: PipelineStage[],
  ): Promise<T[]>;
}

export interface AggregateFacetResult<T = unknown> {
  data: T[];
  totalCount: { count: number }[];
}
