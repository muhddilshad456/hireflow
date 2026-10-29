import { RECRUITER_BASE_ROUTE } from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";

export const getRecruiterDashboard = () => {
  return api.get(`/${RECRUITER_BASE_ROUTE}/dashboard`).then((res) => res.data);
};
