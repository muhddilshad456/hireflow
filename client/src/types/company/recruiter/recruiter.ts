export interface RecruiterDashboardData {
  stats: {
    openJobs: number;
    totalJobs: number;
    totalApplicants: number;
    inProgress: number;
    selected: number;
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
