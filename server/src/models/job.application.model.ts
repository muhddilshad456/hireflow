import { Schema, Types, model } from "mongoose";

export interface IApplication {
  _id: Types.ObjectId;

  jobId: Types.ObjectId;
  userId: Types.ObjectId;

  resumeUrl: string;
  coverLetter: string;

  status:
    | "APPLIED"
    | "IN_PROGRESS"
    | "REJECTED"
    | "SELECTED"
    | "OFFER_SENT"
    | "ACCEPTED"
    | "DECLINED";

  currentStageId?: Types.ObjectId;

  appliedAt: Date;

  offerDetails?: {
    salary?: number;
    joiningDate?: Date;
    expiryDate?: Date;
  };
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeUrl: {
      type: String,
      required: true,
    },

    coverLetter: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "APPLIED",
        "IN_PROGRESS",
        "REJECTED",
        "SELECTED",
        "OFFER_SENT",
        "ACCEPTED",
        "DECLINED",
      ],
      default: "APPLIED",
    },

    currentStageId: {
      type: Schema.Types.ObjectId,
      ref: "JobStage",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    offerDetails: {
      salary: Number,
      joiningDate: Date,
      expiryDate: Date,
    },
  },
  { timestamps: true },
);

export const ApplicationModel = model<IApplication>(
  "Application",
  applicationSchema,
);
