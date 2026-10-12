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
