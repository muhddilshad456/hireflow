import { inject, injectable } from "inversify";
import { JobDto } from "../../../../../dtos/v1/job/job.dto";
import { IRecruiterService } from "../interface/IRecruiterService";
import { IUserRepository } from "../../../../../repositories/user/interfaces/IUserRepository";
import { TYPES } from "../../../../../dependency-injection/types";
import { JobMapper } from "../../../../../mapper/job/jobMapper";
import { IJobRepository } from "../../../../../repositories/job/interface/IJobRepository";
import { NotFoundError } from "../../../../../errors/not-found.error";
import { BadRequestError } from "../../../../../errors/bad-request.error";
import { InternalServerError } from "../../../../../errors/internal-server.error";
import { Logger } from "pino";
import { IJobStageRepository } from "../../../../../repositories/job/interface/IJobStageRepository";

@injectable()
export class RecruiterService implements IRecruiterService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.JobStageRepository)
    private jobStageRepository: IJobStageRepository,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}
  //* create a job
  async createJob(dto: JobDto, recruiterId: string): Promise<any> {
    this.logger.info({
      event: "Job creation started",
    });

    const recruiter = await this.userRepository.findById(recruiterId);

    if (!recruiter) {
      this.logger.warn({
        event: "Recruiter not found",
      });
      throw new NotFoundError("Recruiter not found");
    }

    if (!recruiter.company) {
      this.logger.warn({
        event: "Recruiter not associated with any company",
      });
      throw new BadRequestError("Recruiter not associated with any company");
    }

    const companyId = recruiter.company;

    const data = JobMapper.toJobEntity(dto, recruiter._id, companyId);

    const result = await this.jobRepository.create(data);

    if (!result) {
      this.logger.warn({
        event: "Failed to create job",
      });
      throw new InternalServerError("Failed to create job");
    }

    this.logger.info({
      event: "Job created successfully",
    });

    const selectedStages = dto.pipelineStages || [];

    this.logger.info({
      event: "Pipeline stages received",
      data: selectedStages,
    });

    // 🔹 Normalize stages
    const normalizedStages = selectedStages.map((stage) => stage.toLowerCase());

    this.logger.info({
      event: "Pipeline stages normalized",
      data: normalizedStages,
    });

    // 🔹 Add mandatory stage
    const fullStages = ["resume_review", ...normalizedStages];

    this.logger.info({
      event: "Final pipeline stages prepared (with mandatory stage)",
      data: fullStages,
    });

    // 🔹 Create DB documents
    const stageDocs = fullStages.map((stage, index) => ({
      jobId: result._id,
      type: stage,
      name: stage,
      order: index + 1,
      isMandatory: stage === "resume_review",
    }));

    this.logger.info({
      event: "Stage documents constructed",
      count: stageDocs.length,
      preview: stageDocs.map((s) => ({
        name: s.name,
        order: s.order,
        isMandatory: s.isMandatory,
      })),
    });

    const createdStages = await this.jobStageRepository.createMany(stageDocs);

    if (!createdStages) {
      this.logger.error({
        event: "Failed to create job stages",
        jobId: result._id,
      });

      throw new InternalServerError("Failed to create job stages");
    }

    this.logger.info({
      event: "Job stages created successfully",
      jobId: result._id,
      totalStages: createdStages.length,
    });

    return result;
  }
}
