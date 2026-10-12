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

export const updateMyBasicInfo = (formData: FormData) =>
  api
    .patch("/users/me/basic-info", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);

export const changeMyPassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => api.patch("/users/me/password", data).then((res) => res.data);
