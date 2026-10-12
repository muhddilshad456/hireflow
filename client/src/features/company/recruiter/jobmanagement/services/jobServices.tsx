import { COMMON_ACTIONS } from "../../../../../constents/actions/commonActions";
import {
  APPLICATION_BASE_ROUTE,
  JOB_BASE_ROUTE,
  RECRUITER_BASE_ROUTE,
} from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";
import type { GetStageCandidatesParams } from "../../../../../types/jobTypes";
import type { JobFormData } from "../../../../../types/job/job/jobForm";
import type { Decision } from "../../../../../types/applicaionTypes";

export const createJobApi = (data: JobFormData) => {
  return api
    .post(`/${RECRUITER_BASE_ROUTE}/create-job`, data)
    .then((res) => res.data);
};

export const updateJobApi = (jobId: string, data: JobFormData) => {
  return api
    .put(`/${RECRUITER_BASE_ROUTE}/edit-job/${jobId}`, data)
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

export const updateAssessmentTask = (
  jobId: string,
  stageId: string,
  formData: FormData,
) => {
  return api
    .post(
      `/${JOB_BASE_ROUTE}/${jobId}/stages/${stageId}/assessment`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
    .then((res) => res.data);
};

export const updateJobApplicationStage = (
  applicationStageId: string,
  decision: Decision,
) => {
  return api
    .patch(
      `/${APPLICATION_BASE_ROUTE}/application-stages/${applicationStageId}/decision`,
      { decision },
    )
    .then((res) => res.data);
};
