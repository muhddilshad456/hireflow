import { Types } from "mongoose";
import { AuthUser } from "../../../../types/AuthUser";
import { JobFilters } from "../../../../types/jobFilter";
import { IJobApplication } from "../../../../models/job-application/job.application.model";
import { IJob } from "../../../../models/job/job.model";
import { IJobStage, JobStageName } from "../../../../models/job/job.stage.model";
import { PaginatedJobsResult } from "../../../../repositories/job/interface/IJobRepository";

export interface JobStageDetailsView {
  _id: Types.ObjectId;
  name: JobStageName;
  order: number;
  isMandatory: boolean;
  isActive: boolean;
  documentVerificationDescription: string | null;
  assessmentTaskDescription: string | null;
  assessmentTaskAttachmentUrl: string | null;
}

export interface JobWithDetailsResult {
  job: IJob;
  stages: JobStageDetailsView[];
}

export interface StageCandidatesResult<T = unknown> {
  stage: Partial<IJobStage>;
  candidates: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IJobService {
  getJobs(filter: JobFilters, user: AuthUser): Promise<PaginatedJobsResult>;
  getJob(jobId: string): Promise<IJob | null>;
  updateStatus(jobId: string, status: string): Promise<void>;
  applyJob(userId: string, jobId: string, data: { resumeUrl: string; coverLetter?: string }): Promise<IJobApplication>;
  getJobWithDetails(jobId: string): Promise<JobWithDetailsResult>;
  getStageCandidates(
    jobId: string,
    stageId: string,
    params: { search?: string; status?: string; page: number; limit: number },
  ): Promise<StageCandidatesResult>;
  addAssesmentTask(
    jobId: string,
    stageId: string,
    description?: string,
    file?: Express.Multer.File,
  ): Promise<boolean>;
  applicationStatus(
    jobId: string,
    userId: string,
  ): Promise<{ isApplied: boolean }>;
  setDocVerDescription(
    userId: string,
    jobStageId: string,
    description: string,
  ): Promise<string>;
}
