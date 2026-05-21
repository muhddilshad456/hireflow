import { ADMIN_BASE_ROUTE } from "../../../../constents/apiRoutes";
import api from "../../../../services/api";

export const getUsersApi = async (
  page: number,
  limit: number,
  search: string,
  status: string,
) => {
  return api
    .get(
      `${ADMIN_BASE_ROUTE}/users?page=${page}&&limit=${limit}&&search=${search}&&status=${status}`,
    )
    .then((res) => res.data);
};

export const updateStatusApi = async (userId: string, status: string) => {
  return api
    .patch(`${ADMIN_BASE_ROUTE}/users/status/${userId}`, { status })
    .then((res) => res.data);
};

export const getAllCompanyRequests = async (
  page: number,
  limit: number,
  search: string,
  status: string,
) => {
  return api
    .get(
      `${ADMIN_BASE_ROUTE}/company-verification-requests?page=${page}&&limit=${limit}&&search=${search}&&status=${status}`,
    )
    .then((res) => res.data);
};

export const getCompanyReq = async (id: string) => {
  return api
    .get(`${ADMIN_BASE_ROUTE}/company-verification-request/${id}`)
    .then((res) => res.data);
};

export const approveCompanyApi = async (id: string) => {
  return api
    .post(`${ADMIN_BASE_ROUTE}/approve-company/${id}`)
    .then((res) => res.data);
};
export const rejectCompanyApi = async (
  id: string,
  data: { reason: string },
) => {
  return api
    .patch(`${ADMIN_BASE_ROUTE}/reject-company/${id}`, data)
    .then((res) => res.data);
};

export const getAllCompaniesApi = async () => {
  return api.get(`${ADMIN_BASE_ROUTE}/companies`).then((res) => res.data);
};
