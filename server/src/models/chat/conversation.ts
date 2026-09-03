import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  jobId: Types.ObjectId;
  recruiterId: Types.ObjectId;
  userId: Types.ObjectId;
  createdBy: "company_recruiter" | "user";
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
      unique: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: String,
      enum: ["company_recruiter", "user"],
      required: true,
    },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

conversationSchema.index({ recruiterId: 1, jobId: 1 });
conversationSchema.index({ userId: 1 });
conversationSchema.index({ jobId: 1 });

export const ConversationModel = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
