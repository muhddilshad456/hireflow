import { Types } from "mongoose";
import { IJobApplicationStage } from "../../../models/job-application/job.application.stage.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface IJobApplicationStageRepository extends IBaseRepository<IJobApplicationStage> {
  findByStageIdPaginated<T = unknown>(
    stageId: Types.ObjectId,
    stageName: string,
    {
      search,
      status,
      page,
      limit,
    }: { search?: string; status?: string; page: number; limit: number },
  ): Promise<{ data: T[]; total: number }>;
}
