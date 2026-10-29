import { APPLICATION_ACTIONS } from "../../../../constents/actions/applicationActions";
import { STAGE_ACTIONS } from "../../../../constents/actions/stageActions";
import { APPLICATION_BASE_ROUTE } from "../../../../constents/routes/apiRoutes";
import api from "../../../../services/api";
import type { OfferResponse } from "../../../../types/offer/offer";

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

export const updateVerificationDocuments = (
  applicationStageId: string,
  existingDocuments: string[],
  files: File[],
) => {
  const form = new FormData();
  form.append("existingDocuments", JSON.stringify(existingDocuments));
  files.forEach((file) => form.append("documents", file));

  return api
    .put(
      `/${APPLICATION_BASE_ROUTE}/${applicationStageId}/verification-documents`,
      form,
    )
    .then((res) => res.data);
};
//* offer response
export const updateOfferResponse = (
  applicationStageId: string,
  response: OfferResponse,
) => {
  return api
    .patch(`/${APPLICATION_BASE_ROUTE}/${applicationStageId}/offer-response`, {
      response,
    })
    .then((res) => res.data);
};
//* withdraw application
export const withdrawApplication = (applicationId: string) => {
  return api
    .patch(
      `/${APPLICATION_BASE_ROUTE}/${applicationId}/${APPLICATION_ACTIONS.WITHDRAW_APPLICATION}`,
      {},
    )
    .then((res) => res.data);
};
