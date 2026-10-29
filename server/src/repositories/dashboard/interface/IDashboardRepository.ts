import { Types } from "mongoose";
import {
  CompanyJob,
  InterviewCounts,
  UpcomingInterviewRow,
} from "../implementation/dashboardRepository";
import { ISubscription } from "../../../models/company/subscription.model";
import { RecruiterJob } from "../../../interfaces/company/recruiter/recruiter";
import {
  PendingVerificationRow,
  PlatformCounts,
} from "../../../interfaces/admin/admin";

export interface IDashboardRepository {
  getApplicationsByStatus(
    jobIds: Types.ObjectId[],
  ): Promise<{ status: string; count: number }[]>;
  countApplicantsPerJob(jobIds: Types.ObjectId[]): Promise<Map<string, number>>;
  getJobs(companyId: string): Promise<CompanyJob[]>;
  countTeamMembers(companyId: string, role: string): Promise<number>;
  getSubscriptionByCompanyId(
    companyId: string,
  ): Promise<Pick<ISubscription, "status" | "startDate" | "endDate"> | null>;
  getJobsByCreator(recruiterId: string): Promise<RecruiterJob[]>;
  getInterviewCounts(
    interviewerId: string,
    now: Date,
  ): Promise<InterviewCounts>;
  getUpcomingInterviews(
    interviewerId: string,
    now: Date,
    limit: number,
  ): Promise<UpcomingInterviewRow[]>;
  getPlatformCounts(now: Date): Promise<PlatformCounts>;
  getPendingVerifications(limit: number): Promise<PendingVerificationRow[]>;
}
