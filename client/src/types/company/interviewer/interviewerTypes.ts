export interface InterviewerInfo {
  _id: string;
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
  capabilities: string[];
  bio?: string;
  isAvailable: boolean;
}

export interface GetCompanyInterviewersParams {
  search?: string;
  capability?: string;
  page: number;
  limit: number;
}

export interface PaginatedInterviewersResponse {
  interviewers: InterviewerInfo[];
  total: number;
  page: number;
  totalPages: number;
}

export interface InterviewerDashboardData {
  stats: {
    upcoming: number;
    awaitingFeedback: number;
    completed: number;
    cancelled: number;
  };
  upcomingInterviews: {
    _id: string;
    scheduledAt: string;
    duration?: number;
    candidateName: string;
    jobTitle: string;
    stageName: string;
  }[];
}
