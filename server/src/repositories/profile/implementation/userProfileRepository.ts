import { injectable } from "inversify";
import {
  IUserProfile,
  UserProfileModel,
} from "../../../models/user.profile.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import { IUserProfileRepository } from "../interface/IUserProfileRepository";

@injectable()
export class UserProfileRepository
  extends BaseRepository<IUserProfile>
  implements IUserProfileRepository
{
  constructor() {
    super(UserProfileModel);
  }
}
