import { Request, Response, NextFunction } from "express";

export interface IPasswordController {
  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
