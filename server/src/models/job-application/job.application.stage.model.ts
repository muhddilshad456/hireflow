import { Schema, Types, model, Document } from "mongoose";

export interface IJobApplicationStage extends Document {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  jobStageId: Types.ObjectId;
  status: "IN_PROGRESS" | "PASSED" | "FAILED";
  feedback?: string;
  startedAt?: Date;
  completedAt?: Date;
  // ---- Offer stage only ----
  offerLetterUrl?: string;
  offeredSalary?: number;
  joiningDate?: Date;
  offerSentAt?: Date;
  offerSentBy?: Types.ObjectId;
  offerResponse?: "ACCEPTED" | "DECLINED";
  offerRespondedAt?: Date;
  // ---- Assessment stage only ----
  assessmentResponseText?: string;
  assessmentResponseAttachmentUrl?: string;
  assessmentSubmittedAt?: Date;
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
      enum: ["IN_PROGRESS", "PASSED", "FAILED"],
      default: "IN_PROGRESS",
    },

    feedback: String,
    offerLetterUrl: String,
    offeredSalary: Number,
    joiningDate: Date,
    offerSentAt: Date,
    offerSentBy: { type: Schema.Types.ObjectId, ref: "User" },
    offerResponse: { type: String, enum: ["ACCEPTED", "DECLINED"] },
    offerRespondedAt: Date,
    startedAt: Date,
    completedAt: Date,
    assessmentResponseText: String,
    assessmentResponseAttachmentUrl: String,
    assessmentSubmittedAt: Date,
  },
  { timestamps: true },
);

export const JobApplicationStageModel = model<IJobApplicationStage>(
  "JobApplicationStage",
  jobApplicationStageSchema,
);
