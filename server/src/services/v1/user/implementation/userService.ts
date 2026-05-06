import { inject, injectable } from "inversify";
import { IUserService } from "../interface/IUserService";
import { TYPES } from "../../../../dependency-injection/types";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { NotFoundError } from "../../../../errors/not-found.error";
import { ConflictError } from "../../../../errors/conflict.error";
import { GetAllUsersResponse } from "../../../../types/getAllUsers";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
  ) {}
  async getAllUser(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<GetAllUsersResponse> {
    const { users, totalUsers } = await this.userRepository.getAllUsers(
      page,
      limit,
      search,
      status,
    );

    const totalPages = Math.ceil(totalUsers / limit);

    const formattedUsers = users.map((user) => ({
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      status: user.isBlocked ? "Blocked" : "Active",
    }));

    return {
      users: formattedUsers,
      totalUsers,
      totalPages,
      currentPage: page,
    };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundError("user not found");

    const currentStatus = user.isBlocked ? "BLOCKED" : "ACTIVE";

    if (status == currentStatus) {
      throw new ConflictError(`User already ${currentStatus}`);
    }

    const isBlocked = status == "BLOCKED";

    await this.userRepository.update(id, { isBlocked });
  }
}
