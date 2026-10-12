import type { InterviewerInfo } from "../company/interviewer/interviewerTypes";

export interface InterviewProgress {
  status:
    | "NOT_REQUESTED"
    | "REQUESTED"
    | "WAITING_FOR_RESULT"
    | "COMPLETED"
    | "REJECTED";
  scheduledAt?: string;
  duration?: number;
  interviewer?: InterviewerInfo | null;
  feedback?: string;
  score?: number;
  feedbackSubmittedAt?: string;
  rejectionReason?: string;
  interviewRequestId?: string;
  interviewId?: string;
}

export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface InterviewListItem {
  _id: string;
  scheduledAt: string;
  duration?: number;
  status: InterviewStatus;
  feedback?: string;
  score?: number;
  feedbackSubmittedAt?: string;
  interviewRequestId: string;
  createdAt: string;
  recruiter: { _id: string; name: string };
  jobStage: { _id: string; name: string };
  job: { _id: string; title: string };
  candidate: { _id: string; name: string };
}

export interface GetMyInterviewsResponse {
  requests: InterviewListItem[]; // note: backend key is "requests" (see earlier note)
  total: number;
  page: number;
  totalPages: number;
}

export interface UserBasicInfo {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface InterviewDetails {
  _id: string;
  jobApplicationId: string;
  jobStageId: string;
  interviewerId: string;
  recruiterId: string;
  interviewRequestId: string;
  scheduledAt: string;
  duration?: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  feedback?: string;
  feedbackSubmittedAt?: string;
}

export interface JobSubsetInfo {
  _id: string;
  title: string;
  description: string;
  location: string;
  company: string;
}

export interface JobStageInfo {
  _id: string;
  name: string;
  order: number;
  isMandatory: boolean;
  isActive: boolean;
}

export interface ApplicationInfo {
  _id: string;
  resumeUrl: string;
  coverLetter: string;
  status: string;
}

export interface ExperienceEntry {
  _id: string;
  title: string;
  company: string;
  years: number;
  description?: string;
}

export interface EducationEntry {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
}

export interface UserProfileInfo {
  _id: string;
  skills: string[];
  experience: ExperienceEntry[];
  education?: EducationEntry[];
  summary?: string;
}

export interface GetInterviewDetailsResponse {
  interview: InterviewDetails;
  application: ApplicationInfo;
  candidate: UserBasicInfo;
  job: JobSubsetInfo;
  userProfile: UserProfileInfo | null;
  jobStage: JobStageInfo;
  recruiter: UserBasicInfo;
}
