import { RECRUITER_BASE_ROUTE } from "../../../../../constents/apiRoutes";
import api from "../../../../../services/api";
import type { FormData } from "../components/jobCreateModal";

export const createJobApi = (data: FormData) => {
  return api
    .post(`/${RECRUITER_BASE_ROUTE}/create-job`, data)
    .then((res) => res.data);
};
