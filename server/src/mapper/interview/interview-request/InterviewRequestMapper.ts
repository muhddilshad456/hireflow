import { Types } from "mongoose";
import { CreateInterviewRequestData } from "../../../interfaces/interview/interviewRequest";
import { IInterviewRequest } from "../../../models/interview/interview.request";

export class InterviewRequestMapper {
  static toNewInterviewRequestEntity(
    data: CreateInterviewRequestData,
    requestedBy: string,
  ): Partial<IInterviewRequest> {
    return {
      jobApplicationStageId: new Types.ObjectId(data.jobApplicationStageId),
      requestedBy: new Types.ObjectId(requestedBy),
      interviewerId: new Types.ObjectId(data.interviewerId),
      scheduledAt: new Date(data.scheduledAt),
      status: "PENDING",
    };
  }
}
