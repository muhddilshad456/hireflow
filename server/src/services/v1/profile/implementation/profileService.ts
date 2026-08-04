import { injectable, inject } from "inversify";
import { IProfileService } from "../interface/IProfileService";
import { TYPES } from "../../../../dependency-injection/types";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { IUserProfileRepository } from "../../../../repositories/profile/interface/IUserProfileRepository";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { NotFoundError } from "../../../../errors/not-found.error";
import { Logger } from "pino";
import { USER_MESSAGES } from "../../../../constants/messages/user";
import { PROFILE_MESSAGES } from "../../../../constants/messages/profile";
import { ICloudinaryService } from "../../../cloudinary/interface/ICloudinaryService";
import { UnauthorizedError } from "../../../../errors/unauthorized.error";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { InternalServerError } from "../../../../errors/internal-server.error";
import { CLOUDINARY_MESSAGES } from "../../../../constants/messages/cloudinary";
import { IUserProfile } from "../../../../models/user.profile.model";
import e from "express";
import mongoose from "mongoose";
import { ProfileMapper } from "../../../../mapper/profile/profileMapper";
import { ProfileArrayField } from "../../../../constants/profile/profile.constents";

@injectable()
export class ProfileService implements IProfileService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserProfileRepository)
    private userProfileRepository: IUserProfileRepository,
    @inject(TYPES.CloudinaryService)
    private cloudinaryService: ICloudinaryService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}
  //* get profile
  async getProfile(userId: string): Promise<any> {
    if (!userId) {
      this.logger.warn({
        event: USER_MESSAGES.USER_ID_MISSING,
      });
      throw new BadRequestError(USER_MESSAGES.USER_ID_MISSING);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn({
        userId,
        event: USER_MESSAGES.USER_NOT_FOUND,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const profile = await this.userProfileRepository.findOne({ userId });

    this.logger.info({
      userId,
      event: PROFILE_MESSAGES.FETCH_SUCCESS,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
      profile: profile ?? null,
    };
  }
  //* update basic info
  async updateBasicInfo(
    userId: string,
    name?: string,
    file?: Express.Multer.File,
  ): Promise<boolean> {
    if (!userId) {
      this.logger.warn({
        event: "UPDATE_PROFILE_UNAUTHORIZED",
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    // 🔍 2. Find user
    const user = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn({
        userId,
        event: USER_MESSAGES.USER_NOT_FOUND,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    if (!name && !file) {
      this.logger.warn({
        userId,
        event: PROFILE_MESSAGES.REQUIRED_PROFILE_FIELDS,
      });
      throw new BadRequestError(PROFILE_MESSAGES.REQUIRED_PROFILE_FIELDS);
    }

    let updateData: any = {};

    if (name) {
      updateData.name = name;
    }

    if (file) {
      try {
        const uploaded = await this.cloudinaryService.uploadFile(file);
        updateData.profilePicture = uploaded;
      } catch (error) {
        this.logger.error({
          userId,
          event: CLOUDINARY_MESSAGES.UPLOAD_FAILED,
          error,
        });
        throw new InternalServerError(CLOUDINARY_MESSAGES.UPLOAD_FAILED);
      }
    }

    await this.userRepository.update(userId, updateData);

    this.logger.info({
      userId,
      event: PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
    });

    return true;
  }
  //* update basic profile
  async updateBasicProfile(
    userId: string,
    data: Partial<IUserProfile>,
  ): Promise<any> {
    if (!userId) {
      this.logger.warn({
        event: "UPDATE_PROFILE_UNAUTHORIZED",
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    if (!data || Object.keys(data).length === 0) {
      this.logger.warn({ event: VALIDATION_MESSAGES.REQUIRED_FIELDS });
      throw new BadRequestError(VALIDATION_MESSAGES.REQUIRED_FIELDS);
    }

    const existingProfile = await this.userProfileRepository.findOne({
      userId,
    });

    let result;

    if (!existingProfile) {
      const objectId = new mongoose.Types.ObjectId(userId);
      result = await this.userProfileRepository.create({
        userId: objectId,
        ...data,
      });
    } else {
      result = await this.userProfileRepository.findOneAndUpdate(
        { userId: userId },
        data,
      );
    }

    this.logger.info({
      event: PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
      userId,
    });

    return true;
  }
  //* add skill
  async addSkill(userId: string, skill: string): Promise<any> {
    if (!userId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.USER_ID_REQUIRED,
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    if (!skill || !skill.trim()) {
      this.logger.warn({
        event: PROFILE_MESSAGES.SKILL_REQUIRED,
        userId,
        message: "Skill is required",
      });
      throw new BadRequestError(PROFILE_MESSAGES.SKILL_REQUIRED);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn({
        event: USER_MESSAGES.USER_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const profile = await this.userProfileRepository.findOne({ userId });

    if (!profile) {
      const objectId = new mongoose.Types.ObjectId(userId);
      await this.userProfileRepository.create({ userId: objectId, skills: [] });
    }

    await this.userProfileRepository.addToSet({ userId }, "skills", skill);

    this.logger.info({
      event: PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
      userId,
    });

    return true;
  }
  //* remove skill
  async removeSkill(userId: string, skill: string): Promise<any> {
    if (!userId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.USER_ID_REQUIRED,
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    if (!skill || !skill.trim()) {
      this.logger.warn({
        event: PROFILE_MESSAGES.SKILL_REQUIRED,
        userId,
        message: "Skill is required",
      });
      throw new BadRequestError(PROFILE_MESSAGES.SKILL_REQUIRED);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn({
        event: USER_MESSAGES.USER_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const profile = await this.userProfileRepository.findOne({ userId });

    if (!profile) {
      this.logger.warn({
        event: PROFILE_MESSAGES.PROFILE_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }

    if (!profile.skills || !profile.skills.includes(skill)) {
      this.logger.warn({
        event: PROFILE_MESSAGES.SKILL_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(PROFILE_MESSAGES.SKILL_NOT_FOUND);
    }

    await this.userProfileRepository.pullFromArray({ userId }, "skills", skill);

    this.logger.info({
      event: PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
      userId,
    });

    return true;
  }
  //* resume
  async addResume(userId: string, file: Express.Multer.File): Promise<any> {
    if (!userId) {
      throw new UnauthorizedError("User ID required");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!file) {
      throw new BadRequestError("Resume file required");
    }

    let uploaded;

    try {
      uploaded = await this.cloudinaryService.uploadFile(file);
    } catch (error) {
      throw new InternalServerError("Upload failed");
    }

    const resumeData = ProfileMapper.toResumeEntity(file, uploaded);

    const existingProfile = await this.userProfileRepository.findOne({
      userId,
    });

    let result;

    if (!existingProfile) {
      const objId = new mongoose.Types.ObjectId(userId);
      result = await this.userProfileRepository.create({
        userId: objId,
        resumes: [resumeData],
      });
    } else {
      result = await this.userProfileRepository.findOneAndUpdate(
        { userId },
        { $push: { resumes: resumeData } },
      );
    }

    return result;
  }
  //* delete resume
  async removeResume(userId: string, resumeId: string): Promise<boolean> {
    if (!userId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.USER_ID_REQUIRED,
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    if (!resumeId) {
      this.logger.warn({
        userId,
        event: VALIDATION_MESSAGES.ID_REQUIRED,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const profile = await this.userProfileRepository.findOne({ userId });

    if (!profile) {
      this.logger.warn({
        userId,
        event: PROFILE_MESSAGES.PROFILE_NOT_FOUND,
      });
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }

    const objectResumeId = new mongoose.Types.ObjectId(resumeId);

    const result = await this.userProfileRepository.findOneAndUpdate(
      { userId },
      {
        $pull: {
          resumes: { _id: objectResumeId },
        },
      },
    );

    this.logger.info({
      userId,
      resumeId,
      event: PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
    });

    return true;
  }
  //* profile item
  async addProfileItem(
    userId: string,
    field: ProfileArrayField,
    data: any,
  ): Promise<any> {
    if (!userId) {
      throw new UnauthorizedError("User ID required");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const entityData = ProfileMapper.toArrayItemEntity(field, data);

    const existingProfile = await this.userProfileRepository.findOne({
      userId,
    });

    let result;

    if (!existingProfile) {
      const objId = new mongoose.Types.ObjectId(userId);
      result = await this.userProfileRepository.create({
        userId: objId,
        [field]: [entityData],
      });
    } else {
      result = await this.userProfileRepository.findOneAndUpdate(
        { userId },
        { $push: { [field]: entityData } },
      );
    }

    return result;
  }
  // edit
  async updateProfileItem(
    userId: string,
    field: ProfileArrayField,
    itemId: string,
    data: any,
  ): Promise<any> {
    if (!userId) {
      throw new UnauthorizedError("User ID required");
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new BadRequestError("Invalid item id");
    }

    const existingProfile = await this.userProfileRepository.findOne({
      userId,
    });
    if (!existingProfile) {
      throw new NotFoundError("Profile not found");
    }

    const itemExists = (existingProfile[field] as any[]).some(
      (item: any) => item._id?.toString() === itemId,
    );
    if (!itemExists) {
      throw new NotFoundError(`${field} item not found`);
    }

    const updateFields = ProfileMapper.toArrayItemUpdate(field, data);

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestError("No valid fields provided to update");
    }

    const setPayload: Record<string, any> = {};
    for (const key of Object.keys(updateFields)) {
      setPayload[`${field}.$.${key}`] = updateFields[key];
    }

    const result = await this.userProfileRepository.findOneAndUpdate(
      { userId, [`${field}._id`]: itemId },
      { $set: setPayload },
    );

    return result;
  }
  // delete
  async removeProfileItem(
    userId: string,
    field: ProfileArrayField,
    itemId: string,
  ): Promise<boolean> {
    if (!userId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.USER_ID_REQUIRED,
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    if (!itemId) {
      this.logger.warn({
        userId,
        event: VALIDATION_MESSAGES.ID_REQUIRED,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const profile = await this.userProfileRepository.findOne({ userId });

    if (!profile) {
      this.logger.warn({
        userId,
        event: PROFILE_MESSAGES.PROFILE_NOT_FOUND,
      });
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }

    const objectItemId = new mongoose.Types.ObjectId(itemId);

    const result = await this.userProfileRepository.findOneAndUpdate(
      { userId },
      {
        $pull: {
          [field]: { _id: objectItemId },
        },
      },
    );

    this.logger.info({
      userId,
      field,
      itemId,
      event: PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
    });

    return true;
  }
}
