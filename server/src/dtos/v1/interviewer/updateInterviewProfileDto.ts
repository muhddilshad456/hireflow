import {
  IsArray,
  IsString,
  IsOptional,
  ArrayMaxSize,
  MaxLength,
} from "class-validator";

import { Transform } from "class-transformer";

export class UpdateInterviewerProfileDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v: string) => v?.trim()).filter((v: string) => v?.length > 0)
      : value,
  )
  capabilities?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  bio?: string;
}
