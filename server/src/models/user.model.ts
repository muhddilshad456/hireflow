import mongoose, { Schema, Document, Types } from "mongoose";
import { UserRole } from "../constants/roles";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  isBlocked: boolean;
  role: UserRole;
  otpLastSentAt: Date;
  emailLinkToken: string | null;
  emailLinkTokenExpiry: Date | null;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    otpLastSentAt: {
      type: Date,
    },
    emailLinkToken: {
      type: String,
    },
    emailLinkTokenExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
