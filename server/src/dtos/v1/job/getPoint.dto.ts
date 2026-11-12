import {
  IsArray,
  IsIn,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
} from "class-validator";

export class GeoPointDto {
  @IsIn(["Point"])
  type!: "Point";

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates!: [number, number];
}
