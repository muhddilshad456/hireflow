import { injectable } from "inversify";
import { IJobStage, JobStageModel } from "../../../models/job.stage.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import { IJobStageRepository } from "../interface/IJobStageRepository";
import { ClientSession, Types } from "mongoose";

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
  async findFirstStage(
    jobId: Types.ObjectId,
  ): Promise<Partial<IJobStage> | null> {
    return JobStageModel.findOne({ jobId, order: 1 }).lean();
  }
}
