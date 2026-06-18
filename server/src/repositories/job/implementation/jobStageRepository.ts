import { injectable } from "inversify";
import { IJobStage, JobStageModel } from "../../../models/job.stage.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import { IJobStageRepository } from "../interface/IJobStageRepository";

@injectable()
export class jobStageRepository
  extends BaseRepository<IJobStage>
  implements IJobStageRepository
{
  constructor() {
    super(JobStageModel);
  }
}
