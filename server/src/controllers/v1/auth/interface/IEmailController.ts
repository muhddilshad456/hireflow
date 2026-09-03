import { Request, Response, NextFunction } from "express";

export interface IEmailController {
  changeEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyEmailChange(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
