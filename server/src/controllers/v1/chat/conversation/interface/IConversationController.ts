import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";

export interface IConversationController {
  createOrGet(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;

  list(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
