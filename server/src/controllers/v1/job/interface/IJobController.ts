import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

export interface IJobController {
  getJobs(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  updateStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  applyJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getJobDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getStageCandidates(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
