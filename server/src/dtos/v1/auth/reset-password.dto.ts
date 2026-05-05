import { MinLength, IsString } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
