export interface GetAllUsersResponse {
  users: {
    id: string;
    name: string;
    email: string;
    status: string;
  }[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}
