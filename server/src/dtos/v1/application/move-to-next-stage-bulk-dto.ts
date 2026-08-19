import {
  IsArray,
  ArrayMinSize,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";

export class MoveMultipleToNextStageDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  applicationIds!: string[];

  @IsOptional()
  @IsString()
  feedback?: string;
}
