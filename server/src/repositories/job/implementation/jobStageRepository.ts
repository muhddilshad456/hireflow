import { injectable } from "inversify";
import { IJobStage, JobStageModel } from "../../../models/job.stage.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import { IJobStageRepository } from "../interface/IJobStageRepository";
import { ClientSession } from "mongoose";

@injectable()
export class jobStageRepository
  extends BaseRepository<IJobStage>
  implements IJobStageRepository
{
  constructor() {
    super(JobStageModel);
  }

  async findByJobIdSorted(
    jobId: string,
    session?: ClientSession,
  ): Promise<any> {
    return JobStageModel.find({ jobId, isActive: true })
      .sort({ order: 1 })
      .lean()
      .session(session ?? null);
  }
}
