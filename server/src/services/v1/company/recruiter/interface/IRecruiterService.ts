import { JobDto } from "../../../../../dtos/v1/job/job.dto";

export interface IRecruiterService {
  createJob(dto: JobDto, recruiterId: string): Promise<any>;
}
