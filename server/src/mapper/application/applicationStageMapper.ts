import { AddAssessmentResponseDto } from "../../dtos/v1/application/assessment-responce-dto";

export class ApplicationStageMapper {
  static toAssessmentResponseEntity(
    dto: AddAssessmentResponseDto,
    attachmentUrl?: string,
  ) {
    return {
      assessmentResponseText: dto.text,
      assessmentResponseAttachmentUrl: attachmentUrl,
      assessmentSubmittedAt: new Date(),
    };
  }
}
