import { Types } from "mongoose";
import {
  IInterviewRequest,
  InterviewRequestStatus,
} from "../../models/interview/interview.request";
import { JobStageName } from "../../models/job/job.stage.model";
import { IInterview } from "../../models/interview/interview";

export interface CreateInterviewRequestData {
  jobApplicationStageId: string;
  interviewerId: string;
  scheduledAt: Date;
  message?: string;
}
export interface InterviewRequestListItem {
  _id: Types.ObjectId;
  scheduledAt: Date;
  duration?: number;
  status: InterviewRequestStatus;
  rejectionReason?: string;
  createdAt: Date;
  recruiter: { _id: Types.ObjectId; name: string };
  jobStage: { _id: Types.ObjectId; name: JobStageName };
  application: {
    _id: Types.ObjectId;
    resumeUrl: string;
    coverLetter: string;
    candidate: { _id: Types.ObjectId; name: string };
    job: { _id: Types.ObjectId; title: string };
  };
}

export interface GetMyInterviewRequestsResult {
  requests: InterviewRequestListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetMyInterviewRequestsParams {
  status?: string;
  page: number;
  limit: number;
}

export interface UpdateInterviewRequestDecisionResult {
  request: IInterviewRequest;
  interview: IInterview | null;
}
