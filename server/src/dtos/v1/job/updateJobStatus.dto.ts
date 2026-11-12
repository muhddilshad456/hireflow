import { IsEnum } from "class-validator";

export class UpdateJobStatusDto {
  @IsEnum(["OPEN", "CLOSED"])
  status!: "OPEN" | "CLOSED";
}
