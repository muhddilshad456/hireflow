import { COMPANY_BASE_ROUTE } from "../../../../../constents/apiRoutes";
import api from "../../../../../services/api";

export const verifyRequestApi = (data: FormData) => {
  return api.post(`/${COMPANY_BASE_ROUTE}/verify-request`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
