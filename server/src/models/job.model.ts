import mongoose, { Schema, Document, Types } from "mongoose";

export interface IJob extends Document {
  _id: Types.ObjectId;

  company: Types.ObjectId;
  createdBy: Types.ObjectId;

  title: string;
  description: string;

  location: string;

  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";

  salaryMin?: number;
  salaryMax?: number;

  skills: string[];

  experienceMin?: number;
  experienceMax?: number;

  category: string;

  status: "OPEN" | "CLOSED" | "FILLED";

  applicationDeadline?: Date;

  positions: number;

  applicantsCount: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["IT", "MARKETING", "FINANCE", "HR", "SALES", "OTHER"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    jobType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"],
      required: true,
    },

    salaryMin: {
      type: Number,
    },

    salaryMax: {
      type: Number,
    },

    skills: [
      {
        type: String,
      },
    ],

    experienceMin: {
      type: Number,
    },

    experienceMax: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "FILLED"],
      default: "OPEN",
    },

    applicationDeadline: {
      type: Date,
    },

    positions: {
      type: Number,
      default: 1,
    },

    applicantsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const JobModel = mongoose.model<IJob>("Job", jobSchema);
