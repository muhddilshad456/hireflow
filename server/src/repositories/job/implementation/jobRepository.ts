import { injectable } from "inversify";
import { IJob, JobModel } from "../../../models/job/job.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  IJobRepository,
  PaginatedJobsResult,
} from "../interface/IJobRepository";
import { JobFilters } from "../../../types/jobFilter";
import { JobSubsetInfo } from "../../../interfaces/interview/interview";

@injectable()
export class JobRepository
  extends BaseRepository<IJob>
  implements IJobRepository
{
  constructor() {
    super(JobModel);
  }
  //* get jobs
  async getJobs(filters: JobFilters): Promise<PaginatedJobsResult> {
    const query: Record<string, unknown> = {};

    if (filters.search) {
      query.title = { $regex: filters.search, $options: "i" };
    }

    const hasCoords =
      filters.latitude !== undefined && filters.longitude !== undefined;

    // Text location is only used when there are no coordinates
    if (filters.location && !hasCoords) {
      query.location = { $regex: filters.location, $options: "i" };
    }

    if (filters.workMode?.length) {
      query.workMode = { $in: filters.workMode };
    }

    if (hasCoords) {
      const radiusKm =
        filters.radius && filters.radius > 0 ? filters.radius : 25;
      query.locationCoordinates = {
        $geoWithin: {
          $centerSphere: [
            [filters.longitude, filters.latitude],
            radiusKm / 6378.1,
          ],
        },
      };
    }

    if (filters.jobType?.length) query.jobType = { $in: filters.jobType };

    if (filters.category?.length) query.category = { $in: filters.category };

    if (filters.isActive !== undefined) {
      if (filters.isActive == "Active") {
        query.isActive = true;
      } else if (filters.isActive == "Blocked") {
        query.isActive = false;
      }
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.createdBy) query.createdBy = filters.createdBy;

    if (filters.company) {
      query.company = filters.company;
    }

    const and: Record<string, unknown>[] = [];

    if (filters.salaryMin)
      and.push({ salaryMax: { $gte: Number(filters.salaryMin) } });
    if (filters.salaryMax)
      and.push({ salaryMin: { $lte: Number(filters.salaryMax) } });
    if (filters.experienceMin)
      and.push({ experienceMax: { $gte: Number(filters.experienceMin) } });
    if (filters.experienceMax)
      and.push({ experienceMin: { $lte: Number(filters.experienceMax) } });

    if (and.length) query.$and = and;

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const jobs = await JobModel.find(query)
      .populate("company", "companyName")
      .populate("createdBy", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await JobModel.countDocuments(query);

    return {
      data: jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
  //* get a job
  async getJobDetails(id: string): Promise<IJob | null> {
    return (await JobModel.findById(id)
      .populate("company", "name logo location")
      .populate("createdBy", "name email")
      .lean()) as unknown as IJob | null;
  }
  //* update status
  async updateStatus(id: string, status: string): Promise<void> {
    const isActive = status == "ACTIVE" ? true : false;
    await JobModel.findByIdAndUpdate(id, { isActive });
  }
  //* get job basic details
  async findByIdSelect(
    id: string,
    fields: string,
  ): Promise<JobSubsetInfo | null> {
    return await JobModel.findById(id).select(fields);
  }
  //* update job status
  async updateJobStatus(
    jobId: string,
    status: "OPEN" | "CLOSED",
  ): Promise<IJob | null> {
    return await JobModel.findByIdAndUpdate(
      jobId,
      { $set: { status } },
      { new: true, runValidators: true },
    );
  }
}
