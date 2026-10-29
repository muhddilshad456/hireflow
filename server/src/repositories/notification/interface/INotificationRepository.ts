import { INotification } from "../../../models/notification/notification.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export interface INotificationRepository extends IBaseRepository<INotification> {
  createNotification(data: CreateNotificationData): Promise<INotification>;
  findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: INotification[]; total: number }>;
  countUnread(userId: string): Promise<number>;
  markRead(
    notificationId: string,
    userId: string,
  ): Promise<INotification | null>;
  markAllRead(userId: string): Promise<void>;
}
