import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export enum StageDecision {
  PASSED = "PASSED",
  FAILED = "FAILED",
}

export class UpdateApplicationStageDto {
  @IsNotEmpty()
  @IsEnum(StageDecision, {
    message: "decision must be either PASSED or FAILED",
  })
  decision!: StageDecision;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback?: string;
}
