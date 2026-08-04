import { UPLOAD_ACTIONS } from "../../../constents/actions/uploadActions";
import { UPLOAD_BASE_ROUTE } from "../../../constents/routes/apiRoutes";
import api from "../../../services/api";

export const uploadFile = (data: FormData) => {
  return api
    .post(`/${UPLOAD_BASE_ROUTE}/${UPLOAD_ACTIONS.UPLOAD_FILE}`, data)
    .then((res) => res.data);
};
