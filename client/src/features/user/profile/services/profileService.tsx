import { PROFILE_ACTIONS } from "../../../../constents/actions/profileActions";
import { PROFILE_BASE_ROUTE } from "../../../../constents/routes/apiRoutes";
import api from "../../../../services/api";
import type { Profile } from "../pages/Profile";

export const changeBasicInfo = async (formData: FormData) => {
  return api
    .patch(`/${PROFILE_BASE_ROUTE}/basic-info`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};
//* basic profile
export const changeBasicProfile = async (data: Partial<Profile>) => {
  return api
    .patch(`/${PROFILE_BASE_ROUTE}/basic-profile`, data)
    .then((res) => res.data);
};
//* skills
export const addSkill = async (data: { skill: string }) => {
  return api
    .post(`/${PROFILE_BASE_ROUTE}/skills`, data)
    .then((res) => res.data);
};

export const deleteSkill = async (skill: string) => {
  return api
    .delete(`/${PROFILE_BASE_ROUTE}/skills/${skill}`)
    .then((res) => res.data);
};
//* resume
export const addResumeData = async (formData: FormData) => {
  return api
    .post(`/${PROFILE_BASE_ROUTE}/${PROFILE_ACTIONS.RESUME}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};
//* profile item
//add
export const addProfileItem = async (field: string, data: any) => {
  return api
    .post(`/${PROFILE_BASE_ROUTE}/${PROFILE_ACTIONS.ITEM}/${field}`, data)
    .then((res) => res.data);
};
// edit
export const updateProfileItem = (field: string, itemId: string, data: any) => {
  return api.patch(
    `/${PROFILE_BASE_ROUTE}/${PROFILE_ACTIONS.ITEM}/${field}/${itemId}`,
    data,
  );
};
// delete
export const removeProfileItem = async (field: string, itemId: string) => {
  return api
    .delete(`/${PROFILE_BASE_ROUTE}/items/${field}/${itemId}`)
    .then((res) => res.data);
};
