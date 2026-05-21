import { injectable } from "inversify";
import { IJob, JobModel } from "../../../models/job.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import { IJobRepository } from "../interface/IJobRepository";

@injectable()
export class JobRepository
  extends BaseRepository<IJob>
  implements IJobRepository
{
  constructor() {
    super(JobModel);
  }
}
