import { injectable } from "inversify";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  IInvitation,
  InvitationModel,
} from "../../../models/recruiter.invitation.model";
import { IInvitationRepository } from "../interface/IInvitationRepository";
import { UserRole } from "../../../constants/roles";
import { GetAllInvitationsResult } from "../../../interfaces/company/admin/company";
import { QueryFilter, Types } from "mongoose";

@injectable()
export class InvitationRepository
  extends BaseRepository<IInvitation>
  implements IInvitationRepository
{
  constructor() {
    super(InvitationModel);
  }
  async getAllInvitations(
    page: number,
    limit: number,
    search: string,
    status: string,
    role: UserRole,
    userId: string,
  ): Promise<GetAllInvitationsResult> {
    const skip = (page - 1) * limit;

    const filter: QueryFilter<IInvitation> = {
      companyId: new Types.ObjectId(userId),
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (role) {
      filter.role = role;
    }

    const [invitations, totalInvitations] = await Promise.all([
      InvitationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      InvitationModel.countDocuments(filter),
    ]);

    return {
      invitations,
      totalInvitations,
    };
  }
}
