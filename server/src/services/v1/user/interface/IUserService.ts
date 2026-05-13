import { GetAllUsersResponse } from "../../../../types/getAllUsers";

export interface IUserService {
  getAllUser(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<GetAllUsersResponse>;

  getAllCompanies(): Promise<any>;

  updateStatus(id: string, status: string): Promise<void>;
}
