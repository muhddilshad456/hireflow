import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware.js";

export interface IAuthController {
  signup(req: Request, res: Response, next: NextFunction): Promise<void>;

  login(req: Request, res: Response, next: NextFunction): Promise<void>;

  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;

  resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;

  refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;

  logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;

  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;

  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;

  getCurrentUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;

  getGoogleAuthUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;

  handleGoogleCallback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  acceptInvite(req: Request, res: Response, next: NextFunction): Promise<void>;
  changeEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyEmailChange(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
