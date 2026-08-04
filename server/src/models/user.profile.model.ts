import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserProfile extends Document {
  _id: Types.ObjectId;

  userId: Types.ObjectId;

  profilePicture?: string;

  phone?: string;
  location?: string;

  summary?: string;

  skills: string[];

  education?: {
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number;
  }[];

  experience: {
    _id: Types.ObjectId;
    title: string;
    company: string;
    years: number;
    description?: string;
  }[];

  jobPreference?: {
    role: string;
    type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
    location: string;
    workMode: "ONSITE" | "REMOTE" | "HYBRID";
    expectedSalary?: number;
  };

  resumes: {
    _id?: Types.ObjectId;
    url: string;
    name: string;
    isDefault: boolean;
    uploadedAt: Date;
  }[];

  coverLetters: {
    _id: Types.ObjectId;
    title: string;
    content: string;
    createdAt: Date;
  }[];

  profileCompleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
    },

    profilePicture: { type: String },

    phone: { type: String },
    location: { type: String },

    summary: { type: String },

    skills: {
      type: [String],
      default: [],
    },

    education: [
      {
        degree: { type: String },
        fieldOfStudy: { type: String },
        institution: { type: String },
        graduationYear: { type: Number },
      },
    ],

    experience: [
      {
        title: { type: String },
        company: { type: String },
        years: { type: Number },
        description: { type: String },
      },
    ],

    jobPreference: {
      role: { type: String },
      type: {
        type: String,
        enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"],
      },
      location: { type: String },
      workMode: {
        type: String,
        enum: ["ONSITE", "REMOTE", "HYBRID"],
      },
      expectedSalary: { type: Number },
    },

    resumes: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    coverLetters: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const UserProfileModel = mongoose.model<IUserProfile>(
  "UserProfile",
  userProfileSchema,
);
