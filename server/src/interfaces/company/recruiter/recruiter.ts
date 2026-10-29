import { Types } from "mongoose";

export interface RecruiterProfileResponse {
  userId: string;
  name: string;
  email: string;
  profilePicture: string | null;
  companyName: string | null;
}

export interface RecruiterDashboard {
  stats: {
    openJobs: number;
    totalJobs: number;
    totalApplicants: number;
    inProgress: number;
    selected: number;
  };
  applicationsByStatus: { status: string; count: number }[];
  latestJobs: {
    _id: string;
    title: string;
    status: string;
    applicantsCount: number;
    createdAt: string;
  }[];
}

export interface RecruiterJob {
  _id: Types.ObjectId;
  title: string;
  status: string;
  createdAt: Date;
}
