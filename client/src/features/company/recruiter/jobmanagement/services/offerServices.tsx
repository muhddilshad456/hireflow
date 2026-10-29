import { APPLICATION_BASE_ROUTE } from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";

export const uploadOfferLetter = (applicationStageId: string, file: File) => {
  const form = new FormData();
  form.append("offerLetter", file);

  return api
    .put(`/${APPLICATION_BASE_ROUTE}/${applicationStageId}/offer-letter`, form)
    .then((res) => res.data);
};
