import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";

export enum InterviewRequestDecision {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export class InterviewRequestDecisionDto {
  @IsNotEmpty()
  @IsEnum(InterviewRequestDecision, {
    message: "decision must be either ACCEPTED or REJECTED",
  })
  decision!: InterviewRequestDecision;

  @ValidateIf((dto) => dto.decision === InterviewRequestDecision.REJECTED)
  @IsNotEmpty({
    message: "rejectionReason is required when rejecting a request",
  })
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;
}
