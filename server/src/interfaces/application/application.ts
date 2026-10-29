import { Types } from "mongoose";
import { IJobApplication } from "../../models/job-application/job.application.model";
import { IJobStage, JobStageName } from "../../models/job/job.stage.model";
import { IJobApplicationStage } from "../../models/job-application/job.application.stage.model";
import { IJob } from "../../models/job/job.model";
import { InterviewStatus } from "../../models/interview/interview";

export interface GetMyApplicationsFilters {
  search?: string;
  page: number;
  limit: number;
}

export interface UpdateApplicationStageResult {
  application: IJobApplication;
  stageId: Types.ObjectId;
  nextStage: IJobApplication | null;
}

export interface ApplicationStageDetailsResult {
  jobStage: IJobStage;
  applicationStage: IJobApplicationStage | null;
}

export interface InterviewBasicUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

export interface StageInterviewInfo {
  _id: Types.ObjectId;
  scheduledAt: Date;
  duration?: number;
  status: InterviewStatus;
  feedback?: string;
  feedbackSubmittedAt?: Date;
  interviewer: InterviewBasicUser;
  recruiter: InterviewBasicUser;
}

export type ApplicationStageDisplayStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PASSED"
  | "FAILED";

export interface ApplicationStageSummary {
  _id: Types.ObjectId; // JobStage id
  name: JobStageName;
  order: number;
  isMandatory: boolean;
  status: ApplicationStageDisplayStatus;
  feedback?: string;
  startedAt?: Date;
  completedAt?: Date;
  applicationStageId?: Types.ObjectId;
  interview: StageInterviewInfo | null;
}

export interface MyApplicationDetailsResult {
  _id: Types.ObjectId;
  status: "IN_PROGRESS" | "REJECTED" | "SELECTED" | "OFFER_SENT" | "WITHDRAWN";
  appliedAt: Date;
  resumeUrl: string;
  coverLetter: string;
  currentStageId?: Types.ObjectId;
  offerDetails?: {
    salary?: number;
    joiningDate?: Date;
    expiryDate?: Date;
  };
  stages: ApplicationStageSummary[];
  job: IJob;
}

export interface MyApplicationItemJob {
  _id: Types.ObjectId;
  title: string;
  company: Types.ObjectId;
  location: string;
  jobType: string;
  status: string;
}

export interface MyApplicationItem {
  _id: Types.ObjectId;
  status: string;
  appliedAt: Date;
  resumeUrl: string;
  coverLetter?: string;
  currentStageId?: Types.ObjectId;
  offerDetails?: unknown;
  job: MyApplicationItemJob;
}

export interface MyApplicationsResponse {
  applications: MyApplicationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
