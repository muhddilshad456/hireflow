import { COMMON_ACTIONS } from "../../../../../constents/actions/commonActions";
import {
  JOB_BASE_ROUTE,
  RECRUITER_BASE_ROUTE,
} from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";
import type { GetStageCandidatesParams } from "../../../../../types/jobTypes";
import type { FormData } from "../components/jobCreateModal";

export const createJobApi = (data: FormData) => {
  return api
    .post(`/${RECRUITER_BASE_ROUTE}/create-job`, data)
    .then((res) => res.data);
};

export const jobDetails = (jobId: string) => {
  return api
    .get(`/${JOB_BASE_ROUTE}/${COMMON_ACTIONS.DETAILS}/${jobId}`)
    .then((res) => res.data);
};

export const getStageCandidates = (
  jobId: string,
  stageId: string,
  { search, status, page, limit }: GetStageCandidatesParams,
) => {
  return api
    .get(`/${JOB_BASE_ROUTE}/${jobId}/stages/${stageId}/candidates`, {
      params: { search, status, page, limit },
    })
    .then((res) => res.data);
};
