import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

export interface INotificationController {
  getNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  markAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  markAllAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
