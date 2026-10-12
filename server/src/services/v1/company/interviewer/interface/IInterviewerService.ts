import { InterviewRequestDecisionDto } from "../../../../../dtos/v1/interview/interviewRequestDecisionDto";
import {
  GetMyInterviewParams,
  GetMyInterviewsResult,
} from "../../../../../interfaces/interview/interview";
import {
  GetMyInterviewRequestsParams,
  GetMyInterviewRequestsResult,
  UpdateInterviewRequestDecisionResult,
} from "../../../../../interfaces/interview/interviewRequest";
import {
  InterviewerProfileResponse,
  UpdateInterviewerProfile,
} from "../../../../../interfaces/interviewer/interviewer";
import { IInterviewerProfile } from "../../../../../models/profiles/interviewer.profile.model";

export interface IInterviewerService {
  toggleAvailability(
    userId: string,
    isAvailable: boolean,
  ): Promise<{ isAvailable: boolean }>;
  updateInterviewerProfile(
    userId: string,
    dto: UpdateInterviewerProfile,
  ): Promise<IInterviewerProfile>;
  getInterviewerProfile(userId: string): Promise<InterviewerProfileResponse>;
  getInterviewRequests(
    userId: string,
    params: GetMyInterviewRequestsParams,
  ): Promise<GetMyInterviewRequestsResult>;
  updateIntReqDecision(
    requestId: string,
    dto: InterviewRequestDecisionDto,
    userId: string,
  ): Promise<UpdateInterviewRequestDecisionResult>;
  getInterviews(
    userId: string,
    params: GetMyInterviewParams,
  ): Promise<GetMyInterviewsResult>;
}
