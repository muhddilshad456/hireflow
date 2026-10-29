import {
  NotificationListResult,
  NotifyPayload,
} from "../../../../interfaces/notification/notification";

export interface INotificationService {
  notify(userId: string, payload: NotifyPayload): Promise<void>;
  notifyMany(userIds: string[], payload: NotifyPayload): Promise<void>;
  getNotifications(
    userId: string,
    page: number,
    limit: number,
  ): Promise<NotificationListResult>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
