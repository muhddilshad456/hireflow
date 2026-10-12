import { Types } from "mongoose";
import { IJobStage, JobStageName } from "../../models/job/job.stage.model";
import { IInterview, InterviewStatus } from "../../models/interview/interview";
import { IJobApplication } from "../../models/job-application/job.application.model";
import { IUserProfile } from "../../models/profiles/user.profile.model";

export interface GetMyInterviewParams {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface InterviewListItem {
  _id: Types.ObjectId;

  scheduledAt: Date;
  duration?: number;
  status: InterviewStatus;

  feedback?: string;
  score?: number;
  feedbackSubmittedAt?: Date;

  interviewRequestId: Types.ObjectId;
  createdAt: Date;

  recruiter: {
    _id: Types.ObjectId;
    name: string;
  };

  jobStage: {
    _id: Types.ObjectId;
    name: JobStageName;
  };

  job: {
    _id: Types.ObjectId;
    title: string;
  };

  candidate: {
    _id: Types.ObjectId;
    name: string;
  };
}

export interface GetMyInterviewsResult {
  requests: InterviewListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserBasicInfo {
  _id: Types.ObjectId;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface JobSubsetInfo {
  _id: Types.ObjectId;
  title: string;
  description: string;
  location: string;
  company: Types.ObjectId;
}

export interface GetInterviewDetailsResult {
  interview: IInterview;
  application: IJobApplication;
  candidate: UserBasicInfo;
  job: JobSubsetInfo;
  userProfile: IUserProfile | null;
  jobStage: IJobStage;
  recruiter: UserBasicInfo;
}
