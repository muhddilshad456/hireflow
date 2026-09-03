import { IsMongoId } from "class-validator";

export class ConversationDto {
  @IsMongoId()
  applicationId!: string;
}
