import { Schema, Types, model, Document } from "mongoose";

export interface IJobStage extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  name: string;
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
