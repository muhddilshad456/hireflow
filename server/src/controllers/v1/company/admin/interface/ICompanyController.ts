import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";

export interface ICompanyController {
  createVerifyRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;

  getVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;

  invite(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCompanyProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getDashboard(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getAllInvitations(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getRecruiters(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getInterviewers(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  cancelInvitation(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
