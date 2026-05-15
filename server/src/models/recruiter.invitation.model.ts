import mongoose, { Schema, Document, Types } from "mongoose";
import { UserRole } from "../constants/roles";

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface IInvitation extends Document {
  _id: Types.ObjectId;

  name: string;
  email: string;
  companyId: Types.ObjectId;
  role: UserRole;

  status: InvitationStatus;

  token: string; // hashed token
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.COMPANY_RECRUITER,
    },

    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },

    token: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export const InvitationModel = mongoose.model<IInvitation>(
  "Invitation",
  InvitationSchema,
);
