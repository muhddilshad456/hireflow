import mongoose, { Schema, Document, Types } from "mongoose";

export const INTERVIEW_STATUS = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type InterviewStatus = (typeof INTERVIEW_STATUS)[number];

export interface IInterview extends Document {
  _id: Types.ObjectId;

  jobApplicationId: Types.ObjectId;
  jobStageId: Types.ObjectId;

  interviewerId: Types.ObjectId;
  recruiterId: Types.ObjectId;

  interviewRequestId: Types.ObjectId;

  scheduledAt: Date;
  duration?: number;

  meetingId: string;

  status: InterviewStatus;

  feedback?: string;

  feedbackSubmittedAt?: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    jobApplicationId: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
    },

    jobStageId: {
      type: Schema.Types.ObjectId,
      ref: "JobStage",
      required: true,
    },

    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewRequestId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewRequest",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
    },
    meetingId: {
      type: String,
    },

    status: {
      type: String,
      enum: INTERVIEW_STATUS,
      default: "SCHEDULED",
    },

    feedback: {
      type: String,
    },

    feedbackSubmittedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const InterviewModel = mongoose.model<IInterview>(
  "Interview",
  interviewSchema,
);
