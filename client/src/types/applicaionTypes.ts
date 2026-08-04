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
