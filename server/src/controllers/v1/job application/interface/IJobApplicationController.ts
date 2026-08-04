import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

export interface IJobApplicationController {
  getMyApplications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getMyApplicationDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  moveToNextStage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
