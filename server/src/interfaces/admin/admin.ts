export interface AdminProfileResponse {
  userId: string;
  name: string;
  email: string;
  profilePicture: string | null;
}
export interface PlatformCounts {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  pendingVerifications: number;
  candidates: number;
  totalJobs: number;
  activeSubscriptions: number;
}

export interface PendingVerificationRow {
  _id: string;
  companyName: string;
  verificationType: string; // "NEW" | "UPDATE"
  email: string;
  createdAt: Date;
}
export interface AdminDashboard {
  stats: PlatformCounts;
  pendingVerificationRequests: {
    _id: string;
    companyName: string;
    verificationType: string;
    email: string;
    createdAt: string;
  }[];
}
