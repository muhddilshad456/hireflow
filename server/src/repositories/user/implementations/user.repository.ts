import { IUserRepository } from "../interfaces/IUserRepository.js";
import { BaseRepository } from "../../base/implementation/base.repository.js";
import { UserModel, IUser } from "../../../models/user.model.js";
import { injectable } from "inversify";
import { QueryFilter } from "mongoose";
import { GetUsersResponse } from "../../../types/userRepo.js";

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }
  async findByRefreshToken(token: string) {
    return await UserModel.findOne({ refreshToken: token });
  }
  async removeRefreshToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshToken: null });
  }
  async findByResetToken(token: string): Promise<IUser | null> {
    return await UserModel.findOne({ emailLinkToken: token });
  }
  async getAllUsers(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<GetUsersResponse> {
    const skip = (page - 1) * limit;

    const filter: QueryFilter<IUser> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "Blocked") {
      filter.isBlocked = true;
    } else if (status === "Active") {
      filter.isBlocked = false;
    }

    filter.role = "user";

    const users = await UserModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await UserModel.countDocuments(filter);

    return { users, totalUsers };
  }

  async getAllCompanies(): Promise<any> {
    return await UserModel.find({ role: "company_admin" });
  }
}
