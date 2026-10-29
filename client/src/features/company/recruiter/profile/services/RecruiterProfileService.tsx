import api from "../../../../../services/api";

export const getMyRecruiterProfile = () =>
  api.get("/recruiter/profile").then((res) => res.data);
