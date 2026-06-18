import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  IsBoolean,
  IsDateString,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class JobDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsEnum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"])
  jobType!: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  location!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  description!: string;

  // Salary
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @IsBoolean()
  salaryNotDisclosed!: boolean;

  // Skills
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => v.trim()) : [],
  )
  skills!: string[];

  // Experience
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExperience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxExperience?: number;

  @IsBoolean()
  fresherOk!: boolean;

  // Positions
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  positions?: number;

  // Deadline
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  // Stages (optional stages selected by recruiter)
  @IsOptional()
  @IsArray()
  pipelineStages?: string[];
}
