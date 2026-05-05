import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  Length,
} from "class-validator";
import { Transform } from "class-transformer";

export class VerifyReqDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  regNumber!: string;

  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[\d\s\-()]{7,}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined)
  @Matches(/^https?:\/\/.+/, {
    message: "Website must start with http:// or https://",
  })
  website?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  description!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  address!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  country!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  state!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  city!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  @Transform(({ value }) => value.trim())
  zip!: string;
}
