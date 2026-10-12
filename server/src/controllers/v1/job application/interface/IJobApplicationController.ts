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
  updateApplicationStage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  moveMultipleToNextStage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getJobApplicationStageDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  addOrEditAssessmentResponse(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
