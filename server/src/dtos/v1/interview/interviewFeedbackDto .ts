import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class InterviewFeedbackDto {
  @IsNotEmpty({ message: "feedback is required" })
  @IsString()
  @MaxLength(5000)
  feedback!: string;
}
