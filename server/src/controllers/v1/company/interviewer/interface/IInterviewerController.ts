import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";

export interface IInterviewerController {
  toggleAvailability(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  updateInterviewerProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getInterviewerProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getInterviewRequests(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  updateIntReqDecision(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getInterviews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
