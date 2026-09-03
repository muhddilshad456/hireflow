import { Types } from "mongoose";
import { CreatorRole } from "../../../../../interfaces/chat/conversation";

export interface IChatPermissionService {
  hasPassedResumeStage(
    applicationId: Types.ObjectId,
    jobId: Types.ObjectId,
  ): Promise<boolean>;
  canInitiateConversation(
    actorRole: CreatorRole,
    applicationId: Types.ObjectId,
    jobId: Types.ObjectId,
  ): Promise<boolean>;
}
