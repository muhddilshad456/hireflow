import api from "../../../../../services/api";

export const getMyInterviewerProfile = () =>
  api.get("/interviewer/profile").then((res) => res.data);

export const updateMyInterviewerProfile = (data: {
  capabilities: string[];
  bio: string;
}) => api.patch("/interviewer/profile", data).then((res) => res.data);

export const setMyAvailability = (isAvailable: boolean) =>
  api
    .patch("/interviewer/profile/availability", { isAvailable })
    .then((res) => res.data);
