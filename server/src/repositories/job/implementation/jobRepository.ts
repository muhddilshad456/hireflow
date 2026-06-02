import { injectable } from "inversify";
import { IJob, JobModel } from "../../../models/job.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import { IJobRepository } from "../interface/IJobRepository";
import { JobFilters } from "../../../types/jobFilter";

@injectable()
export class JobRepository
  extends BaseRepository<IJob>
  implements IJobRepository
{
  constructor() {
    super(JobModel);
  }
  //* get jobs
  async getJobs(filters: JobFilters) {
    const query: any = {};

    if (filters.search) {
      query.title = { $regex: filters.search, $options: "i" };
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }

    if (filters.jobType) query.jobType = filters.jobType;
    if (filters.createdBy) query.createdBy = filters.createdBy;
    if (filters.category) query.category = filters.category;

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === "true";
    }

    if (filters.salaryMin && filters.salaryMax) {
      query.$and = [
        { salaryMax: { $gte: filters.salaryMin } },
        { salaryMin: { $lte: filters.salaryMax } },
      ];
    } else {
      if (filters.salaryMin) {
        query.salaryMax = { $gte: filters.salaryMin };
      }

      if (filters.salaryMax) {
        query.salaryMin = { $lte: filters.salaryMax };
      }
    }

    if (filters.experienceMin && filters.experienceMax) {
      query.$and = [
        { experienceMax: { $gte: filters.experienceMin } },
        { experienceMin: { $lte: filters.experienceMax } },
      ];
    } else {
      if (filters.experienceMin) {
        query.experienceMax = { $gte: filters.experienceMin };
      }

      if (filters.experienceMax) {
        query.experienceMin = { $lte: filters.experienceMax };
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const jobs = await JobModel.find(query)
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
}
