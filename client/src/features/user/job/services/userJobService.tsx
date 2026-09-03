import { APPLICATION_ACTIONS } from "../../../../constents/actions/applicationActions";
import {
  APPLICATION_BASE_ROUTE,
  JOB_BASE_ROUTE,
} from "../../../../constents/routes/apiRoutes";
import api from "../../../../services/api";
import qs from "qs";

//* apply for the job
export const applyJob = async (jobId: string, data: any) => {
  return api
    .post(`/${JOB_BASE_ROUTE}/apply/${jobId}`, data)
    .then((res) => res.data);
};
//* get applied jobs
export const getMyApplications = async (filter: any) => {
  return api
    .get(
      `/${APPLICATION_BASE_ROUTE}/${APPLICATION_ACTIONS.GET_MY_APPLICATIONS}`,
      {
        params: filter,
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: "repeat" }),
      },
    )
    .then((res) => res.data);
};
//* get application status
export const checkApplicationStatus = async (jobId: string) => {
  return api
    .get(
      `/${JOB_BASE_ROUTE}/${jobId}/${APPLICATION_ACTIONS.APPLICATIONS_STATUS}`,
    )
    .then((res) => res.data);
};
