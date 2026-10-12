import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from "class-validator";

import { Transform } from "class-transformer";

export class CreateInterviewRequestDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  jobApplicationStageId!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  interviewerId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  message?: string;
}
