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

export interface ApiStageCandidate {
  applicationStageId: string;
  status: "IN_PROGRESS" | "PASSED" | "FAILED";
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  startedAt?: string;
  completedAt?: string;
  interviewProgress?: InterviewProgress;
  // ---- Offer stage only ----
  offerLetterUrl?: string;
  offeredSalary?: number;
  joiningDate?: string;
  offerSentAt?: string;
  offerSentBy?: string;
  offerResponse?: "ACCEPTED" | "DECLINED";
  offerRespondedAt?: string;
  application: {
    _id: string;
    userId: { _id: string; name: string; email: string } | null;
    resumeUrl: string;
    coverLetter: string;
    status:
      | "IN_PROGRESS"
      | "REJECTED"
      | "SELECTED"
      | "OFFER_SENT"
      | "WITHDRAWN";
    appliedAt: string;
    currentStageId?: string;
  } | null;
}

export type Decision = "PASSED" | "FAILED";
