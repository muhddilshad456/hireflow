import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

export interface IAdminController {
  getAllCompanyVerificationReq(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getCompanyVerificationReq(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  approveCompany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  rejectCompany(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllCompanies(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getCompanyDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getAdminProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
}
