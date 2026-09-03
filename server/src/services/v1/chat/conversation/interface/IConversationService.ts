import { Types } from "mongoose";
import {
  CandidateConversationView,
  ConversationEntity,
  CreatorRole,
  RecruiterConversationView,
} from "../../../../../interfaces/chat/conversation";

export interface IConversationService {
  getOrCreateConversation(
    applicationId: Types.ObjectId,
    actorId: Types.ObjectId,
    actorRole: CreatorRole,
  ): Promise<RecruiterConversationView | CandidateConversationView>;
  listConversations(
    actorId: Types.ObjectId,
    actorRole: CreatorRole,
    jobId: Types.ObjectId,
  ): Promise<any>;
  isParticipant(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<boolean>;
  assertActiveAndParticipant(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<any>;
}
