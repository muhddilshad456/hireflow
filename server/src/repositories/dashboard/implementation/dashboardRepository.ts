import { injectable } from "inversify";
import { IDashboardRepository } from "../interface/IDashboardRepository";
import { JobApplicationModel } from "../../../models/job-application/job.application.model";
import { Types } from "mongoose";
import { JobModel } from "../../../models/job/job.model";
import { UserModel } from "../../../models/user.model";
import {
  ISubscription,
  SubscriptionModel,
  SubscriptionStatus,
} from "../../../models/company/subscription.model";
import { RecruiterJob } from "../../../interfaces/company/recruiter/recruiter";
import { InterviewModel } from "../../../models/interview/interview";
import { JobStageModel } from "../../../models/job/job.stage.model";
import { CompanyModel } from "../../../models/company/company.model";
import { UserRole } from "../../../constants/roles";
import { VerificationStatus } from "../../../constants/companyStatus";
import { CompanyVerificationModel } from "../../../models/company/company.verification.model";
import {
  PendingVerificationRow,
  PlatformCounts,
} from "../../../interfaces/admin/admin";

export interface CompanyJob {
  _id: Types.ObjectId;
  title: string;
  status: string;
  createdAt: Date;
}

export interface InterviewCounts {
  upcoming: number; // SCHEDULED, time still ahead
  awaitingFeedback: number; // SCHEDULED, time already passed (no feedback yet)
  completed: number;
  cancelled: number;
}

export interface UpcomingInterviewRow {
  _id: string;
  scheduledAt: Date;
  duration?: number;
  candidateName: string;
  jobTitle: string;
  stageName: string;
}

interface InterviewDoc {
  _id: Types.ObjectId;
  jobApplicationId: Types.ObjectId;
  jobStageId: Types.ObjectId;
  scheduledAt: Date;
  duration?: number;
}
interface ApplicationDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
}

interface VerificationDoc {
  _id: Types.ObjectId;
  companyName: string;
  verificationType: string;
  email: string;
  createdAt: Date;
}

@injectable()
export class DashboardRepository implements IDashboardRepository {
  async getApplicationsByStatus(jobIds: Types.ObjectId[]) {
    if (jobIds.length === 0) return [];

    const rows = await JobApplicationModel.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return rows.map((r) => ({ status: r._id, count: r.count }));
  }

  async countApplicantsPerJob(jobIds: Types.ObjectId[]) {
    const counts = new Map<string, number>();
    if (jobIds.length === 0) return counts;

    const rows = await JobApplicationModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);

    rows.forEach((r) => counts.set(r._id.toString(), r.count));
    return counts;
  }
  async getJobs(companyId: string): Promise<CompanyJob[]> {
    return JobModel.find({ company: companyId })
      .select("title status createdAt")
      .sort({ createdAt: -1 })
      .lean<CompanyJob[]>();
  }

  async countTeamMembers(companyId: string, role: string): Promise<number> {
    return UserModel.countDocuments({ company: companyId, role });
  }
  async getSubscriptionByCompanyId(companyId: string) {
    return SubscriptionModel.findOne({ companyId })
      .select("status startDate endDate")
      .lean<Pick<ISubscription, "status" | "startDate" | "endDate">>();
  }
  async getJobsByCreator(recruiterId: string): Promise<RecruiterJob[]> {
    return JobModel.find({ createdBy: recruiterId })
      .select("title status createdAt")
      .sort({ createdAt: -1 })
      .lean<RecruiterJob[]>();
  }
  async getInterviewCounts(
    interviewerId: string,
    now: Date,
  ): Promise<InterviewCounts> {
    const [upcoming, awaitingFeedback, completed, cancelled] =
      await Promise.all([
        InterviewModel.countDocuments({
          interviewerId,
          status: "SCHEDULED",
          scheduledAt: { $gte: now },
        }),
        InterviewModel.countDocuments({
          interviewerId,
          status: "SCHEDULED",
          scheduledAt: { $lt: now },
        }),
        InterviewModel.countDocuments({ interviewerId, status: "COMPLETED" }),
        InterviewModel.countDocuments({ interviewerId, status: "CANCELLED" }),
      ]);

    return { upcoming, awaitingFeedback, completed, cancelled };
  }

  async getUpcomingInterviews(
    interviewerId: string,
    now: Date,
    limit: number,
  ): Promise<UpcomingInterviewRow[]> {
    const interviews = await InterviewModel.find({
      interviewerId,
      status: "SCHEDULED",
      scheduledAt: { $gte: now },
    })
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .select("jobApplicationId jobStageId scheduledAt duration")
      .lean<InterviewDoc[]>();

    if (interviews.length === 0) return [];

    // The names live on other documents. At most `limit` rows, so a few small lookups are fine.
    const applications = await JobApplicationModel.find({
      _id: { $in: interviews.map((i) => i.jobApplicationId) },
    })
      .select("userId jobId")
      .lean<ApplicationDoc[]>();

    const [users, jobs, stages] = await Promise.all([
      UserModel.find({ _id: { $in: applications.map((a) => a.userId) } })
        .select("name")
        .lean<{ _id: Types.ObjectId; name: string }[]>(),
      JobModel.find({ _id: { $in: applications.map((a) => a.jobId) } })
        .select("title")
        .lean<{ _id: Types.ObjectId; title: string }[]>(),
      JobStageModel.find({ _id: { $in: interviews.map((i) => i.jobStageId) } })
        .select("name")
        .lean<{ _id: Types.ObjectId; name: string }[]>(),
    ]);

    const applicationById = new Map(
      applications.map((a) => [a._id.toString(), a]),
    );
    const userName = new Map(users.map((u) => [u._id.toString(), u.name]));
    const jobTitle = new Map(jobs.map((j) => [j._id.toString(), j.title]));
    const stageName = new Map(stages.map((s) => [s._id.toString(), s.name]));

    return interviews.map((i) => {
      const application = applicationById.get(i.jobApplicationId.toString());
      return {
        _id: i._id.toString(),
        scheduledAt: i.scheduledAt,
        duration: i.duration,
        candidateName:
          (application && userName.get(application.userId.toString())) ??
          "Unknown candidate",
        jobTitle:
          (application && jobTitle.get(application.jobId.toString())) ?? "—",
        stageName: stageName.get(i.jobStageId.toString()) ?? "",
      };
    });
  }
  async getPlatformCounts(now: Date): Promise<PlatformCounts> {
    const [
      totalCompanies,
      activeCompanies,
      pendingVerifications,
      candidates,
      totalJobs,
      activeSubscriptions,
    ] = await Promise.all([
      CompanyModel.countDocuments({}),
      CompanyModel.countDocuments({ isActive: true }),
      CompanyVerificationModel.countDocuments({
        status: VerificationStatus.PENDING, // ⚠️ confirm the member name in your enum ("pending")
      }),
      UserModel.countDocuments({ role: UserRole.USER }),
      JobModel.countDocuments({}),
      // Active only if marked ACTIVE AND the end date hasn't passed
      SubscriptionModel.countDocuments({
        status: SubscriptionStatus.ACTIVE,
        endDate: { $gt: now },
      }),
    ]);

    return {
      totalCompanies,
      activeCompanies,
      // Derived so the chart always adds up to the total
      inactiveCompanies: totalCompanies - activeCompanies,
      pendingVerifications,
      candidates,
      totalJobs,
      activeSubscriptions,
    };
  }

  async getPendingVerifications(
    limit: number,
  ): Promise<PendingVerificationRow[]> {
    const rows = await CompanyVerificationModel.find({
      status: VerificationStatus.PENDING,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("companyName verificationType email createdAt")
      .lean<VerificationDoc[]>();

    return rows.map((r) => ({
      _id: r._id.toString(),
      companyName: r.companyName,
      verificationType: r.verificationType,
      email: r.email,
      createdAt: r.createdAt,
    }));
  }
}
