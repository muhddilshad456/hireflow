import { Router } from "express";
import { container } from "../../../dependency-injection/container";
import { TYPES } from "../../../dependency-injection/types";
import { INotificationController } from "../../../controllers/v1/notification/interface/INotificationController";
import { verifyAccessToken } from "../../../middlewares/auth.middleware";

const router = Router();

const notificationController = container.get<INotificationController>(
  TYPES.NotificationController,
);

router.get(
  "/",
  verifyAccessToken,
  notificationController.getNotifications.bind(notificationController),
);

router.patch(
  "/read-all",
  verifyAccessToken,
  notificationController.markAllAsRead.bind(notificationController),
);

router.patch(
  "/:notificationId/read",
  verifyAccessToken,
  notificationController.markAsRead.bind(notificationController),
);

export default router;
