import { PipelineStage } from "mongoose";
import { IJobApplication } from "../../../models/job.application.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface IJobApplicationRepository extends IBaseRepository<IJobApplication> {
  getMyApplicationsAggregate(pipeline: PipelineStage[]): Promise<any[]>;
}
