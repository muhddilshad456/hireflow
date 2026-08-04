import { Schema, Types, model, Document } from "mongoose";

export interface IJobApplicationStage extends Document {
  _id: Types.ObjectId;

  applicationId: Types.ObjectId;
  jobStageId: Types.ObjectId;

  status: "PENDING" | "IN_PROGRESS" | "PASSED" | "FAILED";

  // ----Interview stage only ----
  interviewRequestedAt?: Date;
  interviewRequestedBy?: Types.ObjectId;

  scheduledAt?: Date;

  interviewerId?: Types.ObjectId;

  interviewerFeedback?: string;
  interviewerSubmittedAt?: Date;

  feedback?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;

  // ---- Offer stage only ----

  offerLetterUrl?: string;
  offeredSalary?: number;
  joiningDate?: Date;
  offerSentAt?: Date;
  offerSentBy?: Types.ObjectId;

  offerResponse?: "ACCEPTED" | "DECLINED";
  offerRespondedAt?: Date;

  startedAt?: Date;
  completedAt?: Date;
}

const jobApplicationStageSchema = new Schema<IJobApplicationStage>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
    },

    jobStageId: {
      type: Schema.Types.ObjectId,
      ref: "JobStage",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "PASSED", "FAILED"],
      default: "PENDING",
    },

    interviewRequestedAt: Date,
    interviewRequestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    scheduledAt: Date,

    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    interviewerFeedback: String,

    interviewerSubmittedAt: Date,

    feedback: String,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,

    offerLetterUrl: String,
    offeredSalary: Number,
    joiningDate: Date,
    offerSentAt: Date,
    offerSentBy: { type: Schema.Types.ObjectId, ref: "User" },
    offerResponse: { type: String, enum: ["ACCEPTED", "DECLINED"] },
    offerRespondedAt: Date,

    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true },
);

export const JobApplicationStageModel = model<IJobApplicationStage>(
  "JobApplicationStage",
  jobApplicationStageSchema,
);
