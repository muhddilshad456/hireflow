import { PROFILE_ACTIONS } from "../../../constents/actions/profileActions";
import api from "../../../services/api";

export const fetchProfile = () => {
  return api
    .get(`/profile/${PROFILE_ACTIONS.GET_PROFILE}`)
    .then((res) => res.data);
};
