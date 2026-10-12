import mongoose, { Schema, Types, Document } from "mongoose";

export const INTERVIEW_REQUEST_STATUS = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
] as const;

export type InterviewRequestStatus = (typeof INTERVIEW_REQUEST_STATUS)[number];

export interface IInterviewRequest extends Document {
  _id: Types.ObjectId;

  jobApplicationStageId: Types.ObjectId;

  requestedBy: Types.ObjectId;
  interviewerId: Types.ObjectId;

  scheduledAt: Date;
  duration?: number;

  status: InterviewRequestStatus;

  rejectionReason?: string;
}

const interviewRequestSchema = new Schema<IInterviewRequest>(
  {
    jobApplicationStageId: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
    },

    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
    },

    status: {
      type: String,
      enum: INTERVIEW_REQUEST_STATUS,
      default: "PENDING",
    },

    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true },
);

export const InterviewRequestModel = mongoose.model<IInterviewRequest>(
  "InterviewRequest",
  interviewRequestSchema,
);
