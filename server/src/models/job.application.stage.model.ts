import { Schema, Types, model } from "mongoose";

export interface IApplicationStage {
  _id: Types.ObjectId;

  applicationId: Types.ObjectId;
  jobStageId: Types.ObjectId;

  status: "PENDING" | "IN_PROGRESS" | "PASSED" | "FAILED";

  feedback?: string;

  interviewerId?: Types.ObjectId;

  startedAt?: Date;
  completedAt?: Date;
}

const applicationStageSchema = new Schema<IApplicationStage>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
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

    feedback: String,

    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true },
);

export const ApplicationStageModel = model<IApplicationStage>(
  "ApplicationStage",
  applicationStageSchema,
);
