import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICompany extends Document {
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

  profilePicture?: string | null;
  document: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
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

    profilePicture: {
      type: String,
      default: "",
    },

    document: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const CompanyModel = mongoose.model<ICompany>("Company", companySchema);
