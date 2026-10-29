import mongoose, { Schema, Document, Types } from "mongoose";
import { NOTIFICATION_TTL_DAYS } from "../../constants/notification/notification";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true },
);

// List a user's notifications, newest first
notificationSchema.index({ userId: 1, createdAt: -1 });
// Count a user's unread notifications
notificationSchema.index({ userId: 1, isRead: 1 });
// Auto-delete 30 days after creation (MongoDB checks roughly every minute)
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: NOTIFICATION_TTL_DAYS * 24 * 60 * 60 },
);

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
