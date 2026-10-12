import { INTERVIEW_ACTIONS } from "../../../../../constents/actions/interviewActions";
import { INTERVIEWER_ACTIONS } from "../../../../../constents/actions/interviewersActions";
import { INTERVIEWER_BASE_ROUTE } from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";

export const getMyInterviewRequests = async (params: {
  status?: string;
  page: number;
  limit: number;
}) => {
  return api
    .get(`/${INTERVIEWER_BASE_ROUTE}/${INTERVIEW_ACTIONS.INTERVIEW_REQUESTS}`, {
      params,
    })
    .then((res) => res.data.data);
};

export const updateInterviewRequestDecision = async (
  requestId: string,
  decision: "ACCEPTED" | "REJECTED",
  rejectionReason?: string,
) => {
  return api
    .patch(
      `/${INTERVIEWER_BASE_ROUTE}/${INTERVIEW_ACTIONS.INTERVIEW_REQUESTS}/${requestId}/${INTERVIEWER_ACTIONS.DECISION}`,
      {
        decision,
        rejectionReason,
      },
    )
    .then((res) => res.data);
};
