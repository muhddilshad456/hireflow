import type { InterviewProgress } from "./interview/interview";
import type { JobType } from "./jobTypes";

export type ApplicationStatus =
  | "IN_PROGRESS"
  | "REJECTED"
  | "SELECTED"
  | "OFFER_SENT"
  | "ACCEPTED"
  | "DECLINED";

export interface OfferDetails {
  salary?: number;
  joiningDate?: string;
  expiryDate?: string;
}

export interface ApplicationJob {
  _id: string;
  title: string;
  company: { _id: string; companyName: string };
  location: string;
  jobType: JobType;
  status: "OPEN" | "CLOSED" | "FILLED";
}

export interface JobApplication {
  _id: string;
  status: ApplicationStatus;
  appliedAt: string;
  resumeUrl: string;
  coverLetter?: string;
  currentStageId?: string;
  offerDetails?: OfferDetails;
  job: ApplicationJob;
}

export type StageStatus = "IN_PROGRESS" | "PASSED" | "FAILED";

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
}

export interface ApplicationStageDetail {
  _id: string;
  applicationId: string;
  jobStageId: string;
  status: StageStatus;
  feedback?: string;
  documents?: string[];
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // ---- Interview stages only ----
  interviewProgress?: InterviewProgress;

  // ---- Offer stage only ----
  offerLetterUrl?: string;
  offeredSalary?: number;
  joiningDate?: string;
  offerSentAt?: string;
  offerSentBy?: UserSummary | null;
  offerResponse?: "ACCEPTED" | "DECLINED";
  offerRespondedAt?: string;

  // ---- Assessment stage only ----
  assessmentResponseText?: string;
  assessmentResponseAttachmentUrl?: string;
  assessmentSubmittedAt?: string;
}

export interface ApiStageCandidate {
  _id: string; // same as applicationStage._id
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  applicationStage: ApplicationStageDetail;
  application: {
    _id: string;
    userId: UserSummary | null;
    resumeUrl: string;
    coverLetter: string;
    status: ApplicationStatus | "WITHDRAWN";
    appliedAt: string;
    currentStageId?: string;
  } | null;
}

export type Decision = "PASSED" | "FAILED";
