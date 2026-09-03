import { ClientSession, Types } from "mongoose";
import { IJobStage } from "../../../models/job.stage.model";
import { BaseRepository } from "../../base/implementation/base.repository";

export interface IJobStageRepository extends BaseRepository<IJobStage> {
  findByJobIdSorted(jobId: string, session?: ClientSession): Promise<any>;
  findFirstStage(jobId: Types.ObjectId): Promise<Partial<IJobStage> | null>;
}
