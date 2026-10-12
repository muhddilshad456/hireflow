import { Types } from "mongoose";
import { IInterviewRequest } from "../../../models/interview/interview.request";
import { IJobApplicationStage } from "../../../models/job-application/job.application.stage.model";

export class InterviewMapper {
  static toInterviewEntity(
    request: IInterviewRequest,
    appStage: IJobApplicationStage,
    interviewerUserId: Types.ObjectId,
  ) {
    return {
      jobApplicationId: appStage.applicationId,
      jobStageId: appStage.jobStageId,
      interviewerId: interviewerUserId,
      recruiterId: request.requestedBy,
      interviewRequestId: request._id,
      scheduledAt: request.scheduledAt,
      duration: request.duration,
      status: "SCHEDULED" as const,
    };
  }
}
