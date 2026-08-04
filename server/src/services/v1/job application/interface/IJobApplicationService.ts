import { AuthUser } from "../../../../types/AuthUser";
import { JobFilters } from "../../../../types/jobFilter";

export interface IJobApplicationService {
  getMyApplications(filter: JobFilters, userId: string): Promise<any>;
  getMyApplicationDetails(applicationId: string, userId: string): Promise<any>;
  moveToNextStage(applicationId: string, feedback?: string): Promise<any>;
}
