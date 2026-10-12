import { APPLICATION_ACTIONS } from "../../../../constents/actions/applicationActions";
import { STAGE_ACTIONS } from "../../../../constents/actions/stageActions";
import { APPLICATION_BASE_ROUTE } from "../../../../constents/routes/apiRoutes";
import api from "../../../../services/api";

export const getJobStageDetails = async (
  applicationId: string,
  jobStageId: string,
) => {
  return api
    .get(
      `/${APPLICATION_BASE_ROUTE}/${applicationId}/${STAGE_ACTIONS.STAGE}/${jobStageId}`,
    )
    .then((res) => res.data);
};

export const addOrEditAssessmentResponse = async (
  applicationId: string,
  jobStageId: string,
  formData: FormData,
) => {
  return api
    .post(
      `/${APPLICATION_BASE_ROUTE}/${applicationId}/${STAGE_ACTIONS.STAGE}/${jobStageId}/${APPLICATION_ACTIONS.ASSESSMENT_RESPONSE}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    )
    .then((res) => res.data);
};
