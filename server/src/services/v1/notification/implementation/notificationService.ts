import { inject, injectable } from "inversify";
import { INotificationService } from "../interface/INotificationService";
import { TYPES } from "../../../../dependency-injection/types";
import { INotificationRepository } from "../../../../repositories/notification/interface/INotificationRepository";
import { Logger } from "pino";
import { UnauthorizedError } from "../../../../errors/unauthorized.error";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { NOTIFICATION_MESSAGES } from "../../../../constants/messages/notification";
import { NotFoundError } from "../../../../errors/not-found.error";
import { Types } from "mongoose";
import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_PAGE_SIZE_MAX,
  userRoom,
} from "../../../../constants/notification/notification";
import {
  NotificationDTO,
  NotificationListResult,
  NotifyPayload,
} from "../../../../interfaces/notification/notification";
import { INotification } from "../../../../models/notification/notification.model";
import { getIO } from "../../../../socket/Socketserver";

const toDTO = (n: INotification): NotificationDTO => ({
  _id: n._id.toString(),
  type: n.type,
  title: n.title,
  message: n.message,
  link: n.link,
  isRead: n.isRead,
  createdAt: n.createdAt.toISOString(),
});

injectable();
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private _notificationRepository: INotificationRepository,
    @inject(TYPES.Logger) private _logger: Logger,
  ) {}

  async notify(userId: string, payload: NotifyPayload): Promise<void> {
    try {
      const saved = await this._notificationRepository.createNotification({
        userId,
        ...payload,
      });

      // Live push; if the user is offline they'll see it next time they load
      getIO()?.to(userRoom(userId)).emit(NOTIFICATION_EVENTS.NEW, toDTO(saved));
    } catch (error) {
      // A failed notification must never fail the action that triggered it
      this._logger.error({
        event: NOTIFICATION_MESSAGES.CREATE_FAILED,
        userId,
        type: payload.type,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  async notifyMany(userIds: string[], payload: NotifyPayload): Promise<void> {
    const unique = [...new Set(userIds)];
    await Promise.all(unique.map((id) => this.notify(id, payload)));
  }

  async getNotifications(
    userId: string,
    page: number,
    limit: number,
  ): Promise<NotificationListResult> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), NOTIFICATION_PAGE_SIZE_MAX);

    const [{ items, total }, unreadCount] = await Promise.all([
      this._notificationRepository.findByUser(userId, safePage, safeLimit),
      this._notificationRepository.countUnread(userId),
    ]);

    return {
      notifications: items.map(toDTO),
      total,
      page: safePage,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestError(NOTIFICATION_MESSAGES.INVALID_ID);
    }

    const updated = await this._notificationRepository.markRead(
      notificationId,
      userId,
    );
    if (!updated) throw new NotFoundError(NOTIFICATION_MESSAGES.NOT_FOUND);
  }

  async markAllAsRead(userId: string): Promise<void> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
    await this._notificationRepository.markAllRead(userId);
  }
}
