import { Schema, Types, model, Document } from "mongoose";

export interface IInterviewerProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  capabilities: string[];
  bio?: string;

  isAvailable: boolean;

  isProfileComplete: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const interviewerProfileSchema = new Schema<IInterviewerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    capabilities: {
      type: [String],
      default: [],
    },
    bio: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const InterviewerProfileModel = model<IInterviewerProfile>(
  "InterviewerProfile",
  interviewerProfileSchema,
);
