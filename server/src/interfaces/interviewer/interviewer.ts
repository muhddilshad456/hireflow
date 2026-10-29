export interface UpdateInterviewerProfile {
  capabilities?: string[];
  bio?: string;
}

export interface InterviewerProfileResponse {
  _id: string;
  userId: string;
  name: string;
  email: string;
  profilePicture: string | null;
  companyName: string | null;
  capabilities: string[];
  bio: string;
  isAvailable: boolean;
  isProfileComplete: boolean;
}
export interface InterviewerListItem {
  _id: string;
  userId: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  capabilities: string[];
  bio: string;
  isAvailable: boolean;
}

export interface PaginatedInterviewersResponse {
  interviewers: InterviewerListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface InterviewerDashboard {
  stats: {
    upcoming: number;
    awaitingFeedback: number;
    completed: number;
    cancelled: number; // not a card, only used by the chart
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

export interface IInterviewerDashboardService {
  getDashboard(interviewerId: string): Promise<InterviewerDashboard>;
}
