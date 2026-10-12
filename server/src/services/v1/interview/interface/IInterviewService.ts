import { Types } from "mongoose";
import { InterviewFeedbackDto } from "../../../../dtos/v1/interview/interviewFeedbackDto ";
import { GetInterviewDetailsResult } from "../../../../interfaces/interview/interview";
import { CreateInterviewRequestData } from "../../../../interfaces/interview/interviewRequest";
import { IInterview } from "../../../../models/interview/interview";
import { IInterviewRequest } from "../../../../models/interview/interview.request";

export interface IInterviewService {
  createInterviewRequest(
    recruiterId: string,
    data: CreateInterviewRequestData,
  ): Promise<IInterviewRequest>;
  getInterviewDetails(
    userId: string,
    interviewId: string,
  ): Promise<GetInterviewDetailsResult>;
  submitFeedback(
    userId: string,
    interviewId: string,
    dto: InterviewFeedbackDto,
  ): Promise<IInterview>;
  isParticipant(
    interviewId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<boolean>;
}
