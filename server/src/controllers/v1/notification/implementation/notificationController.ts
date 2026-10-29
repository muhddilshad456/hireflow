import { inject, injectable } from "inversify";
import { INotificationController } from "../interface/INotificationController";
import { TYPES } from "../../../../dependency-injection/types";
import { INotificationService } from "../../../../services/v1/notification/interface/INotificationService";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { NOTIFICATION_MESSAGES } from "../../../../constants/messages/notification";

injectable();
export class NotificationController implements INotificationController {
  constructor(
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService,
  ) {}

  async getNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { page, limit } = req.query;

      const result = await this._notificationService.getNotifications(
        userId as string,
        Number(page) || 1,
        Number(limit) || 20,
      );

      ResponseHandler.success(res, NOTIFICATION_MESSAGES.FETCHED, result);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /:notificationId/read
  async markAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { notificationId } = req.params;

      await this._notificationService.markAsRead(
        userId as string,
        notificationId as string,
      );

      ResponseHandler.success(res, NOTIFICATION_MESSAGES.MARKED_READ, null);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /read-all
  async markAllAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      await this._notificationService.markAllAsRead(userId as string);

      ResponseHandler.success(res, NOTIFICATION_MESSAGES.ALL_MARKED_READ, null);
    } catch (error) {
      next(error);
    }
  }
}
