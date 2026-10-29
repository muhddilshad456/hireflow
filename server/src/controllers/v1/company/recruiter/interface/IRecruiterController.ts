import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";

export interface IRecruiterController {
  createJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  updateJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  aiFilterCandidates(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getCompanyInterviewers(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getRecruiterProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getDashboard(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
