import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

export interface ISubscriptionController {
  createCheckoutSession(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getSubscriptionStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  getCompanyAccess(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
