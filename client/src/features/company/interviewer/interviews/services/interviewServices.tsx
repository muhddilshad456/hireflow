import { INTERVIEW_ACTIONS } from "../../../../../constents/actions/interviewActions";
import {
  INTERVIEW_BASE_ROUTE,
  INTERVIEWER_BASE_ROUTE,
} from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";
import type {
  GetInterviewDetailsResponse,
  InterviewDetails,
} from "../../../../../types/interview/interview";

//* get all interviews
export const getMyInterviews = async (params: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  return api
    .get(`/${INTERVIEWER_BASE_ROUTE}/${INTERVIEW_ACTIONS.INTERVIEWS}`, {
      params,
    })
    .then((res) => res.data.data);
};
//* get a interview details
export const getInterviewDetails = async (
  interviewId: string,
): Promise<GetInterviewDetailsResponse> => {
  return api
    .get(
      `/${INTERVIEW_BASE_ROUTE}/${INTERVIEW_ACTIONS.INTERVIEW}/${interviewId}`,
    )
    .then((res) => res.data.data);
};
//* submit interveiw feedback
export const submitInterviewFeedback = async (
  interviewId: string,
  feedback: string,
): Promise<InterviewDetails> => {
  return api
    .patch(
      `/${INTERVIEW_BASE_ROUTE}/${INTERVIEW_ACTIONS.INTERVIEW}/${interviewId}/${INTERVIEW_ACTIONS.FEEDBACK}`,
      { feedback },
    )
    .then((res) => res.data.data);
};
