import api from "../../../../services/api";

export const getMyAdminProfile = () =>
  api.get("/admin/profile").then((res) => res.data);
