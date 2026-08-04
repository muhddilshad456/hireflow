import { Schema, Document, Types, model } from "mongoose";

export interface IJobApplication extends Document {
  _id: Types.ObjectId;

  jobId: Types.ObjectId;
  userId: Types.ObjectId;

  resumeUrl: string;
  coverLetter: string;

  status: "IN_PROGRESS" | "REJECTED" | "SELECTED" | "OFFER_SENT" | "WITHDRAWN";

  currentStageId?: Types.ObjectId;

  appliedAt: Date;

  finalizedAt?: Date;

  offerDetails?: {
    salary?: number;
    joiningDate?: Date;
    expiryDate?: Date;
  };
}

const jobApplicationSchema = new Schema<IJobApplication>(
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
        "IN_PROGRESS",
        "REJECTED",
        "SELECTED",
        "OFFER_SENT",
        "ACCEPTED",
        "DECLINED",
      ],
      default: "IN_PROGRESS",
    },

    currentStageId: {
      type: Schema.Types.ObjectId,
      ref: "JobStage",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    finalizedAt: {
      type: Date,
    },

    offerDetails: {
      salary: Number,
      joiningDate: Date,
      expiryDate: Date,
    },
  },
  { timestamps: true },
);

export const JobApplicationModel = model<IJobApplication>(
  "JobApplication",
  jobApplicationSchema,
);
