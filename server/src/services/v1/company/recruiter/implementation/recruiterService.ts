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

@injectable()
export class RecruiterService implements IRecruiterService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}
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

    return result;
  }
}
