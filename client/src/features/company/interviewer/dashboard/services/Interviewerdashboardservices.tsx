import { INTERVIEWER_BASE_ROUTE } from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";

export const getInterviewerDashboard = () => {
  return api
    .get(`/${INTERVIEWER_BASE_ROUTE}/dashboard`)
    .then((res) => res.data);
};
