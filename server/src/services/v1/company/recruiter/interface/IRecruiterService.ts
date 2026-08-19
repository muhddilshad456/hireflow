import { JobDto } from "../../../../../dtos/v1/job/job.dto";

export interface IRecruiterService {
  createJob(dto: JobDto, recruiterId: string): Promise<any>;
  updateJob(jobId: string, dto: JobDto, recruiterId: string): Promise<any>;
  aiFilterCandidates(jobId: string): Promise<any>;
}
