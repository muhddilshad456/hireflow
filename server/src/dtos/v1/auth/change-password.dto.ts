import { MinLength } from "class-validator";

export class ChangePasswordDto {
  @MinLength(6)
  currentPassword!: string;

  @MinLength(6)
  newPassword!: string;
}
