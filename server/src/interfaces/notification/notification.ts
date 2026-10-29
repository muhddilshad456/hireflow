export interface NotifyPayload {
  type: string;
  title: string;
  message: string;
  link?: string;
}

export interface NotificationDTO {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResult {
  notifications: NotificationDTO[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}
