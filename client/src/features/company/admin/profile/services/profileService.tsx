import { COMPANY_BASE_ROUTE } from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";

export const getProfileApi = () => {
  return api.get(`/${COMPANY_BASE_ROUTE}/profile`).then((res) => res.data);
};
