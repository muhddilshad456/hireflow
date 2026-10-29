import { UserRole } from "../../../constants/roles";
import { GetAllInvitationsResult } from "../../../interfaces/company/admin/company";
import { IInvitation } from "../../../models/recruiter.invitation.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface IInvitationRepository extends IBaseRepository<IInvitation> {
  getAllInvitations(
    page: number,
    limit: number,
    search: string,
    status: string,
    role: UserRole,
    userId: string,
  ): Promise<GetAllInvitationsResult>;
}
