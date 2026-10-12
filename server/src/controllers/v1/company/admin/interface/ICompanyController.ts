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
}
