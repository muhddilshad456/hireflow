import { Request, Response, NextFunction } from "express";
import { IProfileController } from "../interface/IProfileController";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IProfileService } from "../../../../services/v1/profile/interface/IProfileService";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { PROFILE_MESSAGES } from "../../../../constants/messages/profile";
import { ProfileArrayField } from "../../../../constants/profile/profile.constents";

export class ProfileController implements IProfileController {
  constructor(
    @inject(TYPES.ProfileService) private profileService: IProfileService,
  ) {}
  //* get profile
  async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await this.profileService.getProfile(userId);
      ResponseHandler.success(res, PROFILE_MESSAGES.FETCH_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
  //* update basic info
  async updateBasicInfo(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { name } = req.body;
      const file = req.file;
      const result = await this.profileService.updateBasicInfo(
        userId,
        name,
        file,
      );
      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* update basic profile
  async updateBasicProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      console.log("user id : ", userId);
      const data = req.body;
      const result = await this.profileService.updateBasicProfile(userId, data);
      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* add skill
  async addSkill(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { skill } = req.body;
      const result = await this.profileService.addSkill(userId, skill);
      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* remove skill
  async removeSkill(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const skill = req.params?.skill as string;
      const result = await this.profileService.removeSkill(userId, skill);
      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* add resume
  async addResume(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const file = req.file;
      const result = await this.profileService.addResume(userId, file);
      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* remore resume
  async removeResume(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const resumeId = req.params.resumeId as string;
      const result = await this.profileService.removeResume(userId, resumeId);
      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* add profile item
  async addProfileItem(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const field = req.params.field as ProfileArrayField;
      const data = req.body;

      const result = await this.profileService.addProfileItem(
        userId,
        field,
        data,
      );

      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* update profile item
  async updateProfileItem(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const field = req.params.field as ProfileArrayField;
      const itemId = req.params.itemId as string;
      const data = req.body;

      const result = await this.profileService.updateProfileItem(
        userId,
        field,
        itemId,
        data,
      );

      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* remove profile item
  async removeProfileItem(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const field = req.params.field as ProfileArrayField;
      const itemId = req.params.itemId as string;

      const result = await this.profileService.removeProfileItem(
        userId,
        field,
        itemId,
      );

      ResponseHandler.success(
        res,
        PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
