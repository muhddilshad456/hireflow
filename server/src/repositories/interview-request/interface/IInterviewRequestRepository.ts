import { Types } from "mongoose";
import { IInterviewRequest } from "../../../models/interview/interview.request";
import { BaseRepository } from "../../base/implementation/base.repository";
import { InterviewRequestListItem } from "../../../interfaces/interview/interviewRequest";

export interface IInterviewRequestRepository extends BaseRepository<IInterviewRequest> {
  findByInterviewerPaginated(
    interviewerProfileId: Types.ObjectId,
    { status, page, limit }: { status?: string; page: number; limit: number },
  ): Promise<{ data: InterviewRequestListItem[]; total: number }>;
}
