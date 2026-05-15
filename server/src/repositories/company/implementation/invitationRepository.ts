import { injectable } from "inversify";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  IInvitation,
  InvitationModel,
} from "../../../models/recruiter.invitation.model";
import { IInvitationRepository } from "../interface/IInvitationRepository";

@injectable()
export class InvitationRepository
  extends BaseRepository<IInvitation>
  implements IInvitationRepository
{
  constructor() {
    super(InvitationModel);
  }
}
