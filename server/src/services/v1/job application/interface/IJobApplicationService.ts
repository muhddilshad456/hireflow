import {
  ApplicationStageDetailsResult,
  MyApplicationDetailsResult,
  UpdateApplicationStageResult,
  GetMyApplicationsFilters,
  MyApplicationsResponse,
} from "../../../../interfaces/application/application";
import { IJobApplication } from "../../../../models/job-application/job.application.model";
import { IJobApplicationStage } from "../../../../models/job-application/job.application.stage.model";
import { IJobStage } from "../../../../models/job/job.stage.model";

export interface IJobApplicationService {
  getMyApplications(
    filter: GetMyApplicationsFilters,
    userId: string,
  ): Promise<MyApplicationsResponse>;
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
    succeeded: { applicationId: string; nextStage: IJobStage | null }[];
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
  updateDocumentsForVerification(
    userId: string,
    applicationStageId: string,
    keepUrls: string[],
    files: Express.Multer.File[],
  ): Promise<string[]>;
  uploadOfferLetter(
    appStageId: string,
    recruiterId: string,
    file: Express.Multer.File | undefined,
  ): Promise<{ offerLetterUrl: string }>;
  updateOfferResponse(
    appStageId: string,
    userId: string,
    response: string,
  ): Promise<{ offerResponse: "ACCEPTED" | "DECLINED" }>;
  withdrawApplication(appId: string, userId: string): Promise<IJobApplication>;
}
