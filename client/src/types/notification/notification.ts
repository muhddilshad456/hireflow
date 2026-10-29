export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListData {
  notifications: AppNotification[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
