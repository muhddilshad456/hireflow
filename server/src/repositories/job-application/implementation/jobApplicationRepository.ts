import { injectable } from "inversify";
import {
  IJobApplication,
  JobApplicationModel,
} from "../../../models/job.application.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import { IJobApplicationRepository } from "../interface/IJobApplicationRepository";
import { PipelineStage } from "mongoose";

@injectable()
export class JobApplicationRepository
  extends BaseRepository<IJobApplication>
  implements IJobApplicationRepository
{
  constructor() {
    super(JobApplicationModel);
  }
  async getMyApplicationsAggregate(pipeline: PipelineStage[]): Promise<any[]> {
    return JobApplicationModel.aggregate(pipeline);
  }
}
