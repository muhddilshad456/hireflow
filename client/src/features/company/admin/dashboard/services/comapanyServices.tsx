import { COMPANY_BASE_ROUTE } from "../../../../../constents/apiRoutes";
import api from "../../../../../services/api";

export const verifyRequestApi = (data: FormData) => {
  return api
    .post(`/${COMPANY_BASE_ROUTE}/verify-request`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const getStatusApi = () => {
  return api
    .get(`/${COMPANY_BASE_ROUTE}/verification-status`)
    .then((res) => res.data);
};

export const inviteApi = (data: {
  name: string;
  email: string;
  role: string;
}) => {
  return api
    .post(`/${COMPANY_BASE_ROUTE}/invite`, data)
    .then((res) => res.data);
};
