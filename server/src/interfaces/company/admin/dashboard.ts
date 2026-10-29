export interface CompanyAdminDashboard {
  stats: {
    openJobs: number;
    totalJobs: number;
    totalApplications: number;
    selected: number;
    recruiters: number;
    interviewers: number;
  };
  subscription: {
    isActive: boolean;
    endDate: string | null;
    daysRemaining: number;
  };
  applicationsByStatus: { status: string; count: number }[];
  latestJobs: {
    _id: string;
    title: string;
    status: string;
    applicantsCount: number;
    createdAt: string;
  }[];
}
