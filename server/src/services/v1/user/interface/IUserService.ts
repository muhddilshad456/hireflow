export interface IUserService {
  getAllUser(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<any>;

  updateStatus(id: string, status: string): Promise<any>;
}
