import qs from "qs";
import { JOB_BASE_ROUTE } from "../../../constents/apiRoutes";
import api from "../../../services/api";
import type { JobFilters } from "../../../types/jobTypes";

export const getJobsApi = (filter: JobFilters) => {
  return api.get(`${JOB_BASE_ROUTE}/jobs`, {
    params: filter,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });
};
export const getJobApi = (id: string) => {
  return api.get(`${JOB_BASE_ROUTE}/job/${id}`);
};
