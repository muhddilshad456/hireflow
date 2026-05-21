import { JobDto } from "../../dtos/v1/job/job.dto";
import { Types } from "mongoose";

export class JobMapper {
  static toJobEntity(
    dto: JobDto,
    recruiterId: Types.ObjectId,
    companyId: Types.ObjectId,
  ) {
    return {
      title: dto.title,
      description: dto.description,
      location: dto.location,
      jobType: dto.jobType,

      salaryMin: dto.minSalary,
      salaryMax: dto.maxSalary,

      skills: dto.skills,

      experienceMin: dto.minExperience,
      experienceMax: dto.maxExperience,

      category: dto.category,

      applicationDeadline: dto.applicationDeadline
        ? new Date(dto.applicationDeadline)
        : undefined,
      positions: dto.positions ?? 1,
      company: companyId,
      createdBy: recruiterId,
      status: "OPEN" as const,
      applicantsCount: 0,
    };
  }
}
