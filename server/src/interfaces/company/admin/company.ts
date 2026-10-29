import { IInvitation } from "../../../models/recruiter.invitation.model";
import { IUser } from "../../../models/user.model";

export interface GetAllInvitationsResult {
  invitations: IInvitation[];
  totalInvitations: number;
}

export interface GetAllCompanyMembersResult {
  members: IUser[];
  totalCount: number;
}
