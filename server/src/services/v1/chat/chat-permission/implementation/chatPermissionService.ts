import { inject } from "inversify";
import { Types } from "mongoose";
import { TYPES } from "../../../../../dependency-injection/types";
import { IJobStageRepository } from "../../../../../repositories/job/interface/IJobStageRepository";
import { IJobApplicationStageRepository } from "../../../../../repositories/job-application/interface/IJobApplicationStageRepository";
import { CreatorRole } from "../../../../../interfaces/chat/conversation";

export class ChatPermissionService {
  constructor(
    @inject(TYPES.JobStageRepository)
    private jobStageRepository: IJobStageRepository,
    @inject(TYPES.JobApplicationStageRepository)
    private jobApplicationStageRepository: IJobApplicationStageRepository,
  ) {}

  async hasPassedResumeStage(
    applicationId: Types.ObjectId,
    jobId: Types.ObjectId,
  ): Promise<boolean> {
    const resumeStage = await this.jobStageRepository.findFirstStage(jobId);
    if (!resumeStage) return false;

    const applicationResumeStage =
      await this.jobApplicationStageRepository.findOne({
        applicationId,
        jobStageId: resumeStage._id,
      });
    if (!applicationResumeStage) return false;
    return applicationResumeStage.status === "PASSED";
  }

  async canInitiateConversation(
    actorRole: CreatorRole,
    applicationId: Types.ObjectId,
    jobId: Types.ObjectId,
  ): Promise<boolean> {
    if (actorRole === "company_recruiter") return true;
    return this.hasPassedResumeStage(applicationId, jobId);
  }
}
