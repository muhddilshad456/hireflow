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
