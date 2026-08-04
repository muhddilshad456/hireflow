import { IsOptional, IsString, MaxLength } from "class-validator";

export class MoveToNextStageDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback?: string;
}
