import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
