import { ProfileArrayField } from "../../../../constants/profile/profile.constents";
import { IUserProfile } from "../../../../models/user.profile.model";

export interface IProfileService {
  getProfile(userId: string): Promise<any>;
  updateBasicInfo(
    userId: string,
    name: string,
    file: Express.Multer.File,
  ): Promise<any>;
  updateBasicProfile(userId: string, data: Partial<IUserProfile>): Promise<any>;
  addSkill(userId: string, skill: string): Promise<any>;
  removeSkill(userId: string, skill: string): Promise<any>;
  addResume(userId: string, file: Express.Multer.File): Promise<any>;
  removeResume(userId: string, resumeId: string): Promise<boolean>;
  addProfileItem(
    userId: string,
    field: ProfileArrayField,
    data: any,
  ): Promise<any>;
  updateProfileItem(
    userId: string,
    field: ProfileArrayField,
    itemId: string,
    data: any,
  ): Promise<any>;
  removeProfileItem(
    userId: string,
    field: ProfileArrayField,
    itemId: string,
  ): Promise<boolean>;
}
