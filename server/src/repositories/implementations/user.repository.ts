import { IUserRepository } from "../interfaces/IUserRepository.js";
import { BaseRepository } from "./base.repository.js";
import { UserModel, IUser } from "../../models/user.model.js";
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
  async getAllUsers(): Promise<any> {
    await UserModel.find({ role: "user" });
  }
}
