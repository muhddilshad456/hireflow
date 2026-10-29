export interface AdminDashboardData {
  stats: {
    totalCompanies: number;
    activeCompanies: number;
    inactiveCompanies: number;
    pendingVerifications: number;
    candidates: number;
    totalJobs: number;
    activeSubscriptions: number;
  };
  pendingVerificationRequests: {
    _id: string;
    companyName: string;
    verificationType: string; // "NEW" | "UPDATE"
    email: string;
    createdAt: string;
  }[];
}
