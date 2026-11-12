import { IUserProfile } from "../../../models/profiles/user.profile.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export type IUserProfileRepository = IBaseRepository<IUserProfile>;
