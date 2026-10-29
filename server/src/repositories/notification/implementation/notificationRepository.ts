import { injectable } from "inversify";
import { INotificationRepository } from "../interface/INotificationRepository";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  INotification,
  NotificationModel,
} from "../../../models/notification/notification.model";
import { CreateNotificationData } from "../../../interfaces/notification/notification";

injectable();
export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }
  async createNotification(
    data: CreateNotificationData,
  ): Promise<INotification> {
    return NotificationModel.create(data);
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: INotification[]; total: number }> {
    const [items, total] = await Promise.all([
      NotificationModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      NotificationModel.countDocuments({ userId }),
    ]);
    return { items, total };
  }

  async countUnread(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, isRead: false });
  }

  // Filtering by userId too, so nobody can mark someone else's notification
  async markRead(
    notificationId: string,
    userId: string,
  ): Promise<INotification | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }
}
