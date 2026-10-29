import { COMPANY_BASE_ROUTE } from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";

export const verifyRequestApi = (data: FormData, type: string) => {
  data.set("verificationType", type);
  return api
    .post(`/${COMPANY_BASE_ROUTE}/verify-request`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const getStatusApi = (type: string) => {
  return api
    .get(`/${COMPANY_BASE_ROUTE}/verification-status?type=${type}`)
    .then((res) => res.data);
};

export const inviteApi = (data: {
  name: string;
  email: string;
  role: string;
}) => {
  return api
    .post(`/${COMPANY_BASE_ROUTE}/invite`, data)
    .then((res) => res.data);
};

export const getCompanyAdminDashboard = () => {
  return api.get(`/${COMPANY_BASE_ROUTE}/dashboard`).then((res) => res.data);
};

export const getInvitationsApi = (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  role: string;
}) =>
  api
    .get(`/${COMPANY_BASE_ROUTE}/invitations`, { params })
    .then((res) => res.data);

export const cancelInvitationApi = (id: string) =>
  api
    .patch(`/${COMPANY_BASE_ROUTE}/cancel-invitation/${id}`)
    .then((res) => res.data);

export const getRecruitersApi = (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => api.get(`/company/recruiters`, { params }).then((res) => res.data);

export const getInterviewersApi = (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => api.get(`/company/interviewers`, { params }).then((res) => res.data);
