export type InterviewRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export interface InterviewRequestListItem {
  _id: string;
  scheduledAt: string;
  duration?: number;
  status: InterviewRequestStatus;
  rejectionReason?: string;
  createdAt: string;
  recruiter: { _id: string; name: string };
  jobStage: { _id: string; name: string };
  application: {
    _id: string;
    resumeUrl: string;
    coverLetter: string;
    candidate: { _id: string; name: string };
    job: { _id: string; title: string };
  };
}

export interface GetMyInterviewRequestsResponse {
  requests: InterviewRequestListItem[];
  total: number;
  page: number;
  totalPages: number;
}
