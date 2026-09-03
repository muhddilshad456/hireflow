import { Types } from "mongoose";

export type CreatorRole = "company_recruiter" | "user";

export interface ConversationEntity {
  _id?: Types.ObjectId;
  applicationId: Types.ObjectId;
  jobId: Types.ObjectId;
  recruiterId: Types.ObjectId;
  userId: Types.ObjectId;
  createdBy: CreatorRole;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecruiterConversationView {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  jobId: { _id: Types.ObjectId; title: string };
  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    avatar?: string;
  };
  createdBy: "company_recruiter" | "user";
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateConversationView {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  jobId: {
    _id: Types.ObjectId;
    title: string;
    company: {
      _id: Types.ObjectId;
      companyName: string;
      profilePicture?: string;
    };
  };
  recruiter: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    avatar?: string;
  };
  createdBy: "company_recruiter" | "candidate";
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
