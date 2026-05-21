import mongoose, { Schema, Document, Types } from "mongoose";
import { VerificationStatus } from "../constants/companyStatus";

export interface ICompanyVerification extends Document {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;

  companyName: string;
  regNumber: string;

  email: string;
  phone: string;
  website?: string;

  description: string;

  address: string;
  country: string;
  state: string;
  city: string;
  zip: string;

  document: string;

  status: VerificationStatus;
  adminNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const companyVerificationSchema = new Schema<ICompanyVerification>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyName: { type: String, required: true },
    regNumber: { type: String, required: true },

    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String },

    description: { type: String, required: true },

    address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },

    document: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.NOT_SUBMITTED,
    },

    adminNote: {
      type: String,
    },
  },
  { timestamps: true },
);

export const CompanyVerificationModel = mongoose.model<ICompanyVerification>(
  "CompanyVerification",
  companyVerificationSchema,
);
