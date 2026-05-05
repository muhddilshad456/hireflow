import { Request, Response, NextFunction } from "express";

export interface IUserController {
  getAllUsers(req: Request, res: Response, next: NextFunction): Promise<any>;
  updateUser(req: Request, res: Response, next: NextFunction): Promise<any>;
}
