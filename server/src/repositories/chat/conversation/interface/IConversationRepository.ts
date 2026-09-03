import { Types } from "mongoose";
import { IConversation } from "../../../../models/chat/conversation";
import { IBaseRepository } from "../../../base/interface/IBaseRepository";
import {
  CandidateConversationView,
  RecruiterConversationView,
} from "../../../../interfaces/chat/conversation";

export interface IConversationRepository extends IBaseRepository<IConversation> {
  updateLastMessage(
    id: Types.ObjectId,
    preview: string,
    at: Date,
  ): Promise<void>;
  deactivate(id: Types.ObjectId): Promise<void>;
  listForRecruiter(
    recruiterId: Types.ObjectId,
    jobId: Types.ObjectId,
  ): Promise<RecruiterConversationView[]>;
  listForCandidate(
    candidateId: Types.ObjectId,
  ): Promise<CandidateConversationView[]>;
  findByIdForRecruiter(
    id: Types.ObjectId,
  ): Promise<RecruiterConversationView | null>;
  findByIdForCandidate(
    id: Types.ObjectId,
  ): Promise<CandidateConversationView | null>;
}
