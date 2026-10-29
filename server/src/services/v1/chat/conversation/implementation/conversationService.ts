import { Types } from "mongoose";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../../../dependency-injection/types";
import { IJobRepository } from "../../../../../repositories/job/interface/IJobRepository";
import { IJobApplicationRepository } from "../../../../../repositories/job-application/interface/IJobApplicationRepository";
import { IConversationRepository } from "../../../../../repositories/chat/conversation/interface/IConversationRepository";
import { IChatPermissionService } from "../../chat-permission/interface/IChatPermissionService";
import { Logger } from "pino";
import {
  CandidateConversationView,
  CreatorRole,
  RecruiterConversationView,
} from "../../../../../interfaces/chat/conversation";
import { NotFoundError } from "../../../../../errors/not-found.error";
import { ForbiddenError } from "../../../../../errors/forbidden.error";
import { ChatMapper } from "../../../../../mapper/chat/chatMapper";
import { CONVERSATION_MESSAGES } from "../../../../../constants/messages/chat/conversation";
import { JOB_MESSAGES } from "../../../../../constants/messages/jobs";
import { APPLICATION_MESSAGES } from "../../../../../constants/messages/application/application";
import { IConversationService } from "../interface/IConversationService";
import { BadRequestError } from "../../../../../errors/bad-request.error";
import { IConversation } from "../../../../../models/chat/conversation";

@injectable()
export class ConversationService implements IConversationService {
  constructor(
    @inject(TYPES.ConversationRepository)
    private _conversationRepository: IConversationRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.JobApplicationRepository)
    private _jobApplicationRepository: IJobApplicationRepository,
    @inject(TYPES.ChatPermissionService)
    private _chatPermissionService: IChatPermissionService,
    @inject(TYPES.Logger) private _logger: Logger,
  ) {}
  //* get or create conversation
  async getOrCreateConversation(
    applicationId: Types.ObjectId,
    actorId: Types.ObjectId,
    actorRole: CreatorRole,
  ): Promise<RecruiterConversationView | CandidateConversationView> {
    this._logger.info({
      event: "CONVERSATION_LOOKUP_STARTED",
      applicationId,
      actorId,
      actorRole,
    });

    const existing = await this._conversationRepository.findOne({
      applicationId,
    });

    let conversationId: Types.ObjectId;

    if (existing) {
      conversationId = existing._id;
    } else {
      const application = await this._jobApplicationRepository.findById(
        applicationId.toString(),
      );
      if (!application) {
        this._logger.warn({
          event: APPLICATION_MESSAGES.APPLICATION_NOT_FOUND,
          applicationId,
        });
        throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
      }

      const job = await this._jobRepository.findById(
        application.jobId.toString(),
      );
      if (!job) {
        this._logger.warn({
          event: JOB_MESSAGES.JOB_NOT_FOUND,
          jobId: application.jobId,
        });
        throw new NotFoundError(JOB_MESSAGES.JOB_NOT_FOUND);
      }

      if (actorRole === "company_recruiter" && !job.createdBy.equals(actorId)) {
        this._logger.warn({
          event: CONVERSATION_MESSAGES.CONVERSATION_FORBIDDEN_NOT_JOB_OWNER,
          actorId,
          jobId: job._id,
        });
        throw new ForbiddenError(
          CONVERSATION_MESSAGES.CONVERSATION_FORBIDDEN_NOT_JOB_OWNER,
        );
      }

      if (actorRole === "user" && !application.userId.equals(actorId)) {
        this._logger.warn({
          event: CONVERSATION_MESSAGES.CONVERSATION_FORBIDDEN_NOT_APPLICANT,
          actorId,
          applicationId,
        });
        throw new ForbiddenError(
          CONVERSATION_MESSAGES.CONVERSATION_FORBIDDEN_NOT_APPLICANT,
        );
      }

      const allowed = await this._chatPermissionService.canInitiateConversation(
        actorRole,
        applicationId,
        job._id,
      );
      if (!allowed) {
        this._logger.warn({
          event:
            CONVERSATION_MESSAGES.CONVERSATION_FORBIDDEN_RESUME_STAGE_NOT_PASSED,
          applicationId,
        });
        throw new ForbiddenError(
          CONVERSATION_MESSAGES.CONVERSATION_FORBIDDEN_RESUME_STAGE_NOT_PASSED,
        );
      }

      const entity = ChatMapper.toNewConversationEntity({
        applicationId,
        jobId: job._id,
        recruiterId: job.createdBy,
        userId: application.userId,
        createdBy: actorRole,
      });

      const conversation = await this._conversationRepository.create(entity);

      this._logger.info({
        event: "CONVERSATION_CREATED",
        conversationId: conversation._id,
        createdBy: actorRole,
      });

      conversationId = conversation._id;
    }

    return actorRole === "company_recruiter"
      ? (await this._conversationRepository.findByIdForRecruiter(
          conversationId,
        ))!
      : (await this._conversationRepository.findByIdForCandidate(
          conversationId,
        ))!;
  }
  //* list conversation
  async listConversations(
    actorId: Types.ObjectId,
    actorRole: CreatorRole,
    jobId: Types.ObjectId,
  ): Promise<RecruiterConversationView[] | CandidateConversationView[]> {
    if (actorRole === "company_recruiter") {
      if (!jobId) {
        throw new BadRequestError(JOB_MESSAGES.JOB_ID_REQUIRED);
      }

      return this._conversationRepository.listForRecruiter(actorId, jobId);
    }

    return this._conversationRepository.listForCandidate(actorId);
  }
  //* check participant of the coversation
  async isParticipant(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    const convo = await this._conversationRepository.findById(
      conversationId.toString(),
    );

    if (!convo) return false;
    return convo.recruiterId.equals(userId) || convo.userId.equals(userId);
  }
  //* security layer
  async assertActiveAndParticipant(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<IConversation> {
    const convo = await this._conversationRepository.findById(
      conversationId.toString(),
    );
    if (!convo)
      throw new NotFoundError(CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND);
    if (!(convo.recruiterId.equals(userId) || convo.userId.equals(userId))) {
      throw new ForbiddenError(
        CONVERSATION_MESSAGES.CONVERSATION_FORBIDDEN_NOT_APPLICANT,
      );
    }
    if (!convo.isActive) {
      throw new ForbiddenError(
        CONVERSATION_MESSAGES.CONVERSATION_ALREADY_CLOSED,
      );
    }
    return convo;
  }
}
