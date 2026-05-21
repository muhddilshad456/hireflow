import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";

export interface IRecruiterController {
  createJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
