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

    if (filters.jobType?.length) query.jobType = { $in: filters.jobType };

    if (filters.category?.length) query.category = { $in: filters.category };

    if (filters.isActive !== undefined) {
      if (filters.isActive == "Active") {
        query.isActive = true;
      } else if (filters.isActive == "Blocked") {
        query.isActive = false;
      }
    }

    if (filters.createdBy) query.createdBy = filters.createdBy;

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
  async getJobDetails(id: string): Promise<any> {
    return await JobModel.findById(id)
      .populate("company", "name logo location")
      .populate("createdBy", "name email")
      .lean();
  }
  //* update status
  async updateStatus(id: string, status: string): Promise<any> {
    const isActive = status == "ACTIVE" ? true : false;
    await JobModel.findByIdAndUpdate(id, { isActive });
  }
}
