import { INTERVIEW_ACTIONS } from "../../../../../constents/actions/interviewActions";
import { INTERVIEWER_ACTIONS } from "../../../../../constents/actions/interviewersActions";
import {
  INTERVIEW_BASE_ROUTE,
  RECRUITER_BASE_ROUTE,
} from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";
import type { GetCompanyInterviewersParams } from "../../../../../types/company/interviewer/interviewerTypes";

export interface RequestInterviewData {
  jobApplicationStageId: string;
  interviewerId: string;
  scheduledAt: string;
  message?: string;
}

export const requestForInterview = (data: RequestInterviewData) => {
  return api
    .post(
      `/${INTERVIEW_BASE_ROUTE}/${INTERVIEW_ACTIONS.INTERVIEW_REQUESTS}`,
      data,
    )
    .then((res) => res.data);
};

export const getCompanyInterviewers = (
  params: GetCompanyInterviewersParams,
) => {
  return api
    .get(`/${RECRUITER_BASE_ROUTE}/${INTERVIEWER_ACTIONS.INTERVIEWERS}`, {
      params,
    })
    .then((res) => res.data.data);
};
