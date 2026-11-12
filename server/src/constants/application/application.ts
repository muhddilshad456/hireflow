import { MyApplicationSummary } from "../../interfaces/application/application";
import { IJob } from "../../models/job/job.model";

export const APPLICATION_EVENTS = {
  UPDATED: "application:updated",
} as const;

export type ApplicationUpdateReason =
  | "STAGE_DECIDED"
  | "OFFER_LETTER_UPLOADED"
  | "OFFER_RESPONDED"
  | "DOCUMENTS_UPDATED"
  | "ASSESSMENT_SUBMITTED"
  | "APPLICATION_WITHDRAWN"
  | "INTERVIEW_RESULT_SUBMITTED"
  | "NEW_APPLICATION_FOR_THE_JOB"
  | "INTERVIEW_REQUEST_DECISION_UPDATED";

export interface ApplicationUpdatedPayload {
  applicationId: string;
  applicationStageId?: string;
  jobId: string;
  reason: ApplicationUpdateReason;
}

export interface IJobWithApplication extends IJob {
  application: MyApplicationSummary | null;
}
