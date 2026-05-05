import { SignupDto } from "../dtos/v1/auth/signup.dto";

export class AuthMapper {
  static toUserEntity(dto: SignupDto) {
    return {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    };
  }
}
