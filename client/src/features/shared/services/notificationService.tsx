import { NOTIFICATION_BASE_ROUTE } from "../../../constents/routes/apiRoutes";
import api from "../../../services/api";
import type {
  ApiResponse,
  NotificationListData,
} from "../../../types/notification/notification";

export const getNotifications = (page = 1, limit = 20) => {
  return api
    .get<ApiResponse<NotificationListData>>(`/${NOTIFICATION_BASE_ROUTE}`, {
      params: { page, limit },
    })
    .then((res) => res.data);
};

export const markNotificationRead = (notificationId: string) => {
  return api
    .patch(`/${NOTIFICATION_BASE_ROUTE}/${notificationId}/read`)
    .then((res) => res.data);
};

export const markAllNotificationsRead = () => {
  return api
    .patch(`/${NOTIFICATION_BASE_ROUTE}/read-all`)
    .then((res) => res.data);
};
