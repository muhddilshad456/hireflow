import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";

export interface IMessageController {
  sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;

  getMessages(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;

  markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
