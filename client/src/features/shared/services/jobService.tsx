import qs from "qs";
import { JOB_BASE_ROUTE } from "../../../constents/routes/apiRoutes";
import api from "../../../services/api";
import type { JobFilters } from "../../../types/jobTypes";

export const getJobsApi = (filter: JobFilters) => {
  return api
    .get(`${JOB_BASE_ROUTE}/jobs`, {
      params: filter,
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat" }),
    })
    .then((res) => res.data);
};

export const getJobApi = (id: string) => {
  return api.get(`${JOB_BASE_ROUTE}/job/${id}`).then((res) => res.data);
};

export const updateJobActiveStatusApi = (id: string, status: string) => {
  return api
    .patch(`${JOB_BASE_ROUTE}/status/${id}`, { status })
    .then((res) => res.data);
};
