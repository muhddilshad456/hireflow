import { Types } from "mongoose";
import { ProfileArrayField } from "../../../../constants/profile/profile.constents";
import { IUserProfile } from "../../../../models/profiles/user.profile.model";
import { UserRole } from "../../../../constants/roles";

export interface UserProfileResponse {
  user: {
    id: Types.ObjectId;
    name: string;
    email: string;
    profilePicture?: string;
    role: UserRole;
  };
  profile: IUserProfile | null;
}

export interface IProfileService {
  getProfile(userId: string): Promise<UserProfileResponse>;
  updateBasicInfo(
    userId: string,
    name: string,
    file: Express.Multer.File,
  ): Promise<boolean>;
  updateBasicProfile(
    userId: string,
    data: Partial<IUserProfile>,
  ): Promise<boolean>;
  addSkill(userId: string, skill: string): Promise<boolean>;
  removeSkill(userId: string, skill: string): Promise<boolean>;
  addResume(
    userId: string,
    file: Express.Multer.File,
    title: string,
  ): Promise<IUserProfile | null>;
  removeResume(userId: string, resumeId: string): Promise<boolean>;
  addProfileItem(
    userId: string,
    field: ProfileArrayField,
    data: Record<string, unknown>,
  ): Promise<IUserProfile | null>;
  updateProfileItem(
    userId: string,
    field: ProfileArrayField,
    itemId: string,
    data: Record<string, unknown>,
  ): Promise<IUserProfile | null>;
  removeProfileItem(
    userId: string,
    field: ProfileArrayField,
    itemId: string,
  ): Promise<boolean>;
}
