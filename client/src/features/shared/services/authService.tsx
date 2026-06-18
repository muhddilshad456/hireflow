import { AUTH_BASE_ROUTE } from "../../../constents/apiRoutes";
import api from "../../../services/api";

export const signUpApi = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  return api.post(`/${AUTH_BASE_ROUTE}/signup`, data).then((res) => res.data);
};

export const verifyOtpApi = async (data: { email: string; otp: string }) => {
  return api
    .post(`/${AUTH_BASE_ROUTE}/verify-otp`, data)
    .then((res) => res.data);
};

export const loginApi = async (data: { email: string; password: string }) => {
  return api.post(`/${AUTH_BASE_ROUTE}/login`, data).then((res) => res.data);
};

export const resendOtpApi = async (data: { email: string }) => {
  return api
    .post(`${AUTH_BASE_ROUTE}/resend-otp`, data)
    .then((res) => res.data);
};

export const forgotPasswordApi = async (data: { email: string }) => {
  return api
    .post(`/${AUTH_BASE_ROUTE}/forgot-password`, data)
    .then((res) => res.data);
};

export const resetPasswordApi = async (data: {
  password: string;
  token: string;
}) => {
  return api
    .post(`${AUTH_BASE_ROUTE}/reset-password`, data)
    .then((res) => res.data);
};

export const getUsersApi = async () => {
  return api.get(`${AUTH_BASE_ROUTE}/check-token`).then((res) => res.data);
};

export const logoutApi = async (data: { id: string }) => {
  return api.post(`${AUTH_BASE_ROUTE}/logout`, data).then((res) => res.data);
};

export const acceptInviteApi = async (data: {
  id: string;
  token: string;
  password: string;
}) => {
  return api
    .post(`${AUTH_BASE_ROUTE}/accept-invite`, data)
    .then((res) => res.data);
};

export const changePasswordApi = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  return api
    .post(`${AUTH_BASE_ROUTE}/change-password`, data)
    .then((res) => res.data);
};
