import { Types } from "mongoose";
import {
  ConversationModel,
  IConversation,
} from "../../../../models/chat/conversation";
import { BaseRepository } from "../../../base/implementation/base.repository";
import { IConversationRepository } from "../interface/IConversationRepository";
import {
  CandidateConversationView,
  RecruiterConversationView,
} from "../../../../interfaces/chat/conversation";
import { injectable } from "inversify";

@injectable()
export class ConversationRepository
  extends BaseRepository<IConversation>
  implements IConversationRepository
{
  constructor() {
    super(ConversationModel);
  }
  async updateLastMessage(
    id: Types.ObjectId,
    preview: string,
    at: Date,
  ): Promise<void> {
    await ConversationModel.findByIdAndUpdate(id, {
      lastMessagePreview: preview,
      lastMessageAt: at,
    });
  }

  async deactivate(id: Types.ObjectId): Promise<void> {
    await ConversationModel.findByIdAndUpdate(id, { isActive: false });
  }

  async listForRecruiter(
    recruiterId: Types.ObjectId,
    jobId: Types.ObjectId,
  ): Promise<RecruiterConversationView[]> {
    const result = await ConversationModel.find({
      recruiterId,
      jobId,
    })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate("jobId", "title")
      .populate("userId", "name email avatar")
      .lean();

    return result.map((conversation) => ({
      ...conversation,
      candidate: conversation.userId,
    })) as unknown as RecruiterConversationView[];
  }

  async listForCandidate(
    candidateId: Types.ObjectId,
  ): Promise<CandidateConversationView[]> {
    const result = await ConversationModel.find({ candidateId })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate({
        path: "jobId",
        select: "title company",
        populate: { path: "company", select: "companyName profilePicture" },
      })
      .populate("recruiterId", "name email avatar")
      .lean();

    return result as unknown as CandidateConversationView[];
  }

  async findByIdForRecruiter(
    id: Types.ObjectId,
  ): Promise<RecruiterConversationView | null> {
    const result = await ConversationModel.findById(id)
      .populate("jobId", "title")
      .populate("userId", "name email avatar")
      .lean();

    if (!result) return null;

    return {
      ...result,
      candidate: result.userId,
    } as unknown as RecruiterConversationView;
  }

  async findByIdForCandidate(
    id: Types.ObjectId,
  ): Promise<CandidateConversationView | null> {
    const result = await ConversationModel.findById(id)
      .populate({
        path: "jobId",
        select: "title company",
        populate: { path: "company", select: "companyName profilePicture" },
      })
      .populate("recruiterId", "name email avatar")
      .lean();

    if (!result) return null;

    const { recruiterId, ...rest } = result;

    return {
      ...rest,
      recruiter: recruiterId,
    } as unknown as CandidateConversationView;
  }
}
