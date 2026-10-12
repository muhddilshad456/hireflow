import { Types } from "mongoose";
import { IInterviewerProfile } from "../../../models/profiles/interviewer.profile.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";
import { InterviewerListItem } from "../../../interfaces/interviewer/interviewer";

export interface IInterviewerProfileRepository extends IBaseRepository<IInterviewerProfile> {
  findByCompanyPaginated(
    companyId: Types.ObjectId,
    {
      search,
      capability,
      page,
      limit,
    }: { search?: string; capability?: string; page: number; limit: number },
  ): Promise<{ data: InterviewerListItem[]; total: number }>;
}
