import { IUserRepository } from "../interfaces/IUserRepository.js";
import { BaseRepository } from "./base.repository.js";
import { UserModel, IUser } from "../../../models/user.model.js";
import { injectable } from "inversify";

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }
  async findByRefreshToken(token: string) {
    return await UserModel.findOne({ refreshToken: token });
  }
  async removeRefreshToken(userId: string): Promise<any> {
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
  ): Promise<any> {
    const skip = (page - 1) * limit;

    let filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 🔹 status filter
    if (status === "Blocked") {
      filter.isBlocked = true;
    } else if (status === "Active") {
      filter.isBlocked = false;
    }

    const users = await UserModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await UserModel.countDocuments(filter);

    return { users, totalUsers };
  }
}
