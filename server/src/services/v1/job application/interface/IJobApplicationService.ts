import {
  ApplicationStageDetailsResult,
  MyApplicationDetailsResult,
  UpdateApplicationStageResult,
} from "../../../../interfaces/application/application";
import { IJobApplicationStage } from "../../../../models/job-application/job.application.stage.model";
import { JobFilters } from "../../../../types/jobFilter";

export interface IJobApplicationService {
  getMyApplications(filter: JobFilters, userId: string): Promise<any>;
  getMyApplicationDetails(
    applicationId: string,
    userId: string,
  ): Promise<MyApplicationDetailsResult>;
  updateApplicationStage(
    appStageId: string,
    decision: string,
    feedback: string | undefined,
    recruiterId: string,
  ): Promise<UpdateApplicationStageResult>;
  moveMultipleToNextStage(
    applicationIds: string[],
    feedback?: string,
  ): Promise<{
    succeeded: { applicationId: string; nextStage: any }[];
    failed: { applicationId: string; reason: string }[];
  }>;
  getJobApplicationStageDetails(
    userId: string,
    applicationId: string,
    jobStageId: string,
  ): Promise<ApplicationStageDetailsResult>;
  addOrEditAssessmentResponse(
    userId: string,
    applicationId: string,
    jobStageId: string,
    text: string | undefined,
    file: Express.Multer.File | undefined,
  ): Promise<IJobApplicationStage>;
}
