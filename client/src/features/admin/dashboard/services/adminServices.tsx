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
