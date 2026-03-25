import mongoose, { Schema, Document, Types } from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  COMPANY_ADMIN = "company_admin",
  COMPANY_RECRUITER = "company_recruiter",
  COMPANY_INTERVIEWER = "company_interviewer",
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  role: UserRole;
  emailOtp: string | null;
  emailOtpExpiry: Date | null;
  otpResendCount: number;
  otpLastSentAt: Date;
  emailLinkToken: string;
  emailLinkTokenExpiry: Date;
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
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    emailOtp: {
      type: String,
    },

    emailOtpExpiry: {
      type: Date,
    },
    otpResendCount: {
      type: Number,
      default: 0,
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
