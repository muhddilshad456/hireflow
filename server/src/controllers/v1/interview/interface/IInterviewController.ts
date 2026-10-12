import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

export interface IInterviewController {
  createInterviewRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getInterviewDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  submitFeedback(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
