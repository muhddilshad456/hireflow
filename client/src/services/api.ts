import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { store } from "../redux/store/store";
import { logout, updateToken } from "../redux/slice/authSlice";
import type { RootState } from "../redux/store/store";

const isLocalhost = window.location.hostname == "localhost";
const API_URL = isLocalhost
  ? import.meta.env.VITE_API_BASE_URL
  : import.meta.env.VITE_P_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

//Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState() as RootState;
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

//Responce interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const res = await api.post<{ accessToken: string }>(
          "/auth/refresh-token",
        );

        const newAccessToken = res.data.accessToken;

        store.dispatch(updateToken(newAccessToken));

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (error) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  },
);

export default api;
