import { Types } from "mongoose";
import { IJobApplicationStage } from "../../../models/job.application.stage.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface IJobApplicationStageRepository extends IBaseRepository<IJobApplicationStage> {
  findByStageIdPaginated(
    stageId: Types.ObjectId,
    {
      search,
      status,
      page,
      limit,
    }: { search?: string; status?: string; page: number; limit: number },
  ): Promise<{ data: any[]; total: number }>;
}
