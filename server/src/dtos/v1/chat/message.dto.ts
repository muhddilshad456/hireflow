import { IsMongoId, IsString, MaxLength, ValidateIf } from "class-validator";

export class MessageDto {
  @IsMongoId()
  conversationId!: string;

  @ValidateIf((o) => !o.hasAttachment)
  @IsString()
  @MaxLength(5000)
  content?: string;
}
