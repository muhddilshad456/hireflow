import { Types } from "mongoose";
import { IInterview } from "../../../models/interview/interview";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  GetMyInterviewParams,
  InterviewListItem,
} from "../../../interfaces/interview/interview";

export interface IInterviewRepository extends BaseRepository<IInterview> {
  findByInterviewerPaginated(
    interviewerId: Types.ObjectId,
    { search, status, page, limit }: GetMyInterviewParams,
  ): Promise<{ data: InterviewListItem[]; total: number }>;
}
