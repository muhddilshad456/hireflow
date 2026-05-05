import {
  IsEnum,
  IsEmail,
  isEnum,
  IsNotEmpty,
  MinLength,
} from "class-validator";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  COMPANY_ADMIN = "company_admin",
}

export class SignupDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
