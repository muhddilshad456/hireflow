import { ADMIN_BASE_ROUTE } from "../../../../constents/apiRoutes";
import api from "../../../../services/api";

export const getAllCompaniesApi = async (
  page: number,
  limit: number,
  search: string,
  status: string,
) => {
  return await api
    .get(
      `${ADMIN_BASE_ROUTE}/companies?page=${page}&limit=${limit}&search=${search}&status=${status}`,
    )
    .then((res) => res.data);
};

export const getCompanyApi = async (id: string) => {
  return await api
    .get(`${ADMIN_BASE_ROUTE}/company/${id}`)
    .then((res) => res.data);
};
