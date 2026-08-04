import { Schema, Types, model, Document } from "mongoose";

export const JOB_STAGE_NAMES = [
  "resume_review",
  "assessment",
  "document_verification",
  "hr_interview",
  "technical_interview",
  "final_hr_interview",
  "offer",
] as const;

export type JobStageName = (typeof JOB_STAGE_NAMES)[number];

export interface IJobStage extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  name: JobStageName;
  order: number;
  isMandatory: boolean;
  isActive: boolean;
}

const jobStageSchema = new Schema<IJobStage>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    name: {
      type: String,
      enum: JOB_STAGE_NAMES,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },
    isMandatory: {
      type: Boolean,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const JobStageModel = model<IJobStage>("JobStage", jobStageSchema);
