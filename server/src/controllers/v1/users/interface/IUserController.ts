import { Request, Response, NextFunction } from "express";

export interface IUserController {
  getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllCompanies(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}
