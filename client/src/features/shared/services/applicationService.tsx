import { APPLICATION_ACTIONS } from "../../../constents/actions/applicationActions";
import { APPLICATION_BASE_ROUTE } from "../../../constents/routes/apiRoutes";
import api from "../../../services/api";

export const getMyApplication = (applicationId: string) => {
  return api
    .get(
      `/${APPLICATION_BASE_ROUTE}/${APPLICATION_ACTIONS.GET_MY_APPLICATIONS}/${applicationId}`,
    )
    .then((res) => res.data);
};
