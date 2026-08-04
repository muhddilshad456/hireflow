import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { ProfileArrayField } from "../../../../constants/profile/profile.constents";

export interface IProfileController {
  getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateBasicInfo(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  updateBasicProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  addSkill(req: Request, res: Response, next: NextFunction): Promise<void>;
  removeSkill(req: Request, res: Response, next: NextFunction): Promise<void>;
  addResume(req: Request, res: Response, next: NextFunction): Promise<void>;
  removeResume(req: Request, res: Response, next: NextFunction): Promise<void>;
  addProfileItem(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  updateProfileItem(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  removeProfileItem(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
