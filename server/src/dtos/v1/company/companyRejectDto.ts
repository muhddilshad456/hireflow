import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class CompanyRejectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  reason!: string;
}
