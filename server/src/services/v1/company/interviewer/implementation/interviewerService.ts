import { inject, injectable } from "inversify";
import { TYPES } from "../../../../../dependency-injection/types";
import { Logger } from "pino";
import { IInterviewerService } from "../interface/IInterviewerService";
import { INTERVIEWER_MESSAGES } from "../../../../../constants/messages/company/interviewer/interviewer";
import { BadRequestError } from "../../../../../errors/bad-request.error";
import { IInterviewerProfileRepository } from "../../../../../repositories/profile/interface/IInterviewerProfileRepository";
import {
  InterviewerProfileResponse,
  UpdateInterviewerProfile,
} from "../../../../../interfaces/interviewer/interviewer";
import { IInterviewerProfile } from "../../../../../models/profiles/interviewer.profile.model";
import mongoose, { Types } from "mongoose";
import { InterviewerProfileMapper } from "../../../../../mapper/company/interviewer/interviewerProfileMapper";
import { VALIDATION_MESSAGES } from "../../../../../constants/messages/validation";
import { IUserRepository } from "../../../../../repositories/user/interfaces/IUserRepository";
import { USER_MESSAGES } from "../../../../../constants/messages/user";
import { NotFoundError } from "../../../../../errors/not-found.error";
import {
  GetMyInterviewRequestsParams,
  GetMyInterviewRequestsResult,
  UpdateInterviewRequestDecisionResult,
} from "../../../../../interfaces/interview/interviewRequest";
import { UnauthorizedError } from "../../../../../errors/unauthorized.error";
import {
  IInterviewRequest,
  INTERVIEW_REQUEST_STATUS,
  InterviewRequestStatus,
} from "../../../../../models/interview/interview.request";
import { INTERVIEW_REQUEST_MESSAGES } from "../../../../../constants/messages/interview/interview-request";
import { IInterviewRequestRepository } from "../../../../../repositories/interview-request/interface/IInterviewRequestRepository";
import {
  InterviewRequestDecision,
  InterviewRequestDecisionDto,
} from "../../../../../dtos/v1/interview/interviewRequestDecisionDto";
import { ConflictError } from "../../../../../errors/conflict.error";
import { ForbiddenError } from "../../../../../errors/forbidden.error";
import { APPLICATION_MESSAGES } from "../../../../../constants/messages/application";
import { IInterviewRepository } from "../../../../../repositories/interview/interface/IInterviewRepository";
import { IJobApplicationStageRepository } from "../../../../../repositories/job-application/interface/IJobApplicationStageRepository";
import { InterviewMapper } from "../../../../../mapper/interview/interview/interviewMapper";
import {
  GetMyInterviewParams,
  GetMyInterviewsResult,
} from "../../../../../interfaces/interview/interview";
import {
  INTERVIEW_STATUS,
  InterviewStatus,
} from "../../../../../models/interview/interview";
import { INTERVIEW_MESSAGES } from "../../../../../constants/messages/interview/interview";

@injectable()
export class InterviewerService implements IInterviewerService {
  constructor(
    @inject(TYPES.InterviewerProfileRepository)
    private interviewerProfileRepository: IInterviewerProfileRepository,
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository,
    @inject(TYPES.InterviewRequestRepository)
    private interviewRequestRepository: IInterviewRequestRepository,
    @inject(TYPES.InterviewRepository)
    private interviewRepository: IInterviewRepository,
    @inject(TYPES.JobApplicationStageRepository)
    private jobApplicationStageRepository: IJobApplicationStageRepository,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}
  //* toggle availability
  async toggleAvailability(
    userId: string,
    isAvailable: boolean,
  ): Promise<{ isAvailable: boolean }> {
    if (typeof isAvailable !== "boolean") {
      throw new BadRequestError(
        INTERVIEWER_MESSAGES.INVALID_AVAILABILITY_VALUE,
      );
    }

    const profile = await this.interviewerProfileRepository.findOne({ userId });

    if (!profile) {
      this.logger.warn({
        event: INTERVIEWER_MESSAGES.PROFILE_NOT_FOUND,
        userId,
      });
      throw new BadRequestError(INTERVIEWER_MESSAGES.PROFILE_INCOMPLETE);
    }

    const isProfileComplete = Boolean(
      profile.capabilities?.length > 0 && profile.bio?.trim(),
    );

    if (!isProfileComplete) {
      this.logger.warn({
        event: INTERVIEWER_MESSAGES.PROFILE_INCOMPLETE,
        userId,
      });
      throw new BadRequestError(INTERVIEWER_MESSAGES.PROFILE_INCOMPLETE);
    }

    const updated = await this.interviewerProfileRepository.findOneAndUpdate(
      { userId },
      { isAvailable },
    );

    if (!updated) {
      this.logger.error({
        event: INTERVIEWER_MESSAGES.PROFILE_UPDATE_FAILED,
        userId,
      });

      throw new BadRequestError(INTERVIEWER_MESSAGES.PROFILE_UPDATE_FAILED);
    }

    this.logger.info({
      event: INTERVIEWER_MESSAGES.AVAILABILITY_UPDATED,
      userId,
      isAvailable,
    });

    return { isAvailable: updated.isAvailable };
  }
  //* update interviewer profile
  async updateInterviewerProfile(
    userId: string,
    dto: UpdateInterviewerProfile,
  ): Promise<IInterviewerProfile> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError(VALIDATION_MESSAGES.INVALIED_USER_ID);
    }

    if (dto.capabilities !== undefined && !Array.isArray(dto.capabilities)) {
      throw new BadRequestError(INTERVIEWER_MESSAGES.INVALID_CAPABILITIES);
    }

    if (dto.capabilities !== undefined) {
      const cleanedCapabilities = dto.capabilities
        .map((capability) => capability.trim())
        .filter((capability) => capability.length > 0);

      if (cleanedCapabilities.length > 20) {
        throw new BadRequestError(INTERVIEWER_MESSAGES.TOO_MANY_CAPABILITIES);
      }

      dto.capabilities = cleanedCapabilities;
    }

    if (dto.bio !== undefined && dto.bio.length > 1000) {
      throw new BadRequestError(INTERVIEWER_MESSAGES.BIO_TOO_LONG);
    }

    const userObjectId = new Types.ObjectId(userId);

    let profile = await this.interviewerProfileRepository.findOne({
      userId,
    });

    if (!profile) {
      profile = await this.interviewerProfileRepository.create(
        InterviewerProfileMapper.toNewInterviewerProfileEntity({
          userId: userObjectId,
          capabilities: dto.capabilities ?? [],
          bio: dto.bio ?? "",
        }),
      );

      this.logger.info({
        event: INTERVIEWER_MESSAGES.PROFILE_CREATED,
        userId,
      });

      return profile;
    }

    const capabilities =
      dto.capabilities !== undefined ? dto.capabilities : profile.capabilities;

    const bio = dto.bio !== undefined ? dto.bio : profile.bio;

    const updateData =
      InterviewerProfileMapper.toUpdateInterviewerProfileEntity({
        capabilities,
        bio,
      });

    profile = await this.interviewerProfileRepository.findOneAndUpdate(
      { userId },
      updateData,
    );

    if (!profile) {
      this.logger.error({
        event: INTERVIEWER_MESSAGES.PROFILE_UPDATE_FAILED,
        userId,
      });

      throw new BadRequestError(INTERVIEWER_MESSAGES.PROFILE_UPDATE_FAILED);
    }

    this.logger.info({
      event: INTERVIEWER_MESSAGES.PROFILE_UPDATED,
      userId,
    });

    return profile;
  }
  //* get profile
  async getInterviewerProfile(
    userId: string,
  ): Promise<InterviewerProfileResponse> {
    const user = await this.userRepository.findByIdWithCompany(userId);

    if (!user) {
      this.logger.warn({
        event: USER_MESSAGES.USER_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const userObjectId = new Types.ObjectId(userId);

    let profile = await this.interviewerProfileRepository.findOne({
      userId: userObjectId,
    });

    if (!profile) {
      profile = await this.interviewerProfileRepository.create({
        userId: userObjectId,
        capabilities: [],
        bio: "",
        isAvailable: false,
      });

      this.logger.info({
        event: INTERVIEWER_MESSAGES.PROFILE_AUTO_CREATED,
        userId,
      });
    }

    return {
      _id: profile._id.toString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture ?? null,
      companyName: user.company?.companyName ?? null,
      capabilities: profile.capabilities,
      bio: profile.bio ?? "",
      isAvailable: profile.isAvailable,
      isProfileComplete: profile.isProfileComplete,
    };
  }
  //* get interview requests
  async getInterviewRequests(
    userId: string,
    params: GetMyInterviewRequestsParams,
  ): Promise<GetMyInterviewRequestsResult> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
    const interviewerProfile = await this.interviewerProfileRepository.findOne({
      userId,
    });
    if (!interviewerProfile) {
      this.logger.warn({
        event: INTERVIEWER_MESSAGES.PROFILE_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(INTERVIEWER_MESSAGES.PROFILE_NOT_FOUND);
    }

    if (
      params.status &&
      !INTERVIEW_REQUEST_STATUS.includes(
        params.status as InterviewRequestStatus,
      )
    ) {
      this.logger.warn({
        event: INTERVIEW_REQUEST_MESSAGES.INVALID_STATUS,
        status: params.status,
      });
      throw new BadRequestError(INTERVIEW_REQUEST_MESSAGES.INVALID_STATUS);
    }

    const { data, total } =
      await this.interviewRequestRepository.findByInterviewerPaginated(
        new Types.ObjectId(userId),
        params,
      );

    return {
      requests: data,
      total,
      page: params.page,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  }
  //* update interview req decision
  async updateIntReqDecision(
    requestId: string,
    dto: InterviewRequestDecisionDto,
    userId: string,
  ): Promise<UpdateInterviewRequestDecisionResult> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const session = await mongoose.startSession();

    try {
      let result!: UpdateInterviewRequestDecisionResult;

      await session.withTransaction(async () => {
        const request = await this.interviewRequestRepository.findById(
          requestId,
          session,
        );
        if (!request) {
          this.logger.warn({
            event: INTERVIEW_REQUEST_MESSAGES.INTERVIEW_REQUEST_NOT_FOUND,
            requestId,
          });
          throw new NotFoundError(
            INTERVIEW_REQUEST_MESSAGES.INTERVIEW_REQUEST_NOT_FOUND,
          );
        }

        if (request.status !== "PENDING") {
          this.logger.warn({
            event: INTERVIEW_REQUEST_MESSAGES.REQUEST_ALREADY_ACTIONED,
            requestId,
          });
          throw new ConflictError(
            INTERVIEW_REQUEST_MESSAGES.REQUEST_ALREADY_ACTIONED,
          );
        }

        const interviewerProfile =
          await this.interviewerProfileRepository.findOne({ userId }, session);

        if (!interviewerProfile) {
          this.logger.warn({
            event: INTERVIEW_REQUEST_MESSAGES.NOT_AUTHORIZED,
            userId,
          });
          throw new ForbiddenError(INTERVIEW_REQUEST_MESSAGES.NOT_AUTHORIZED);
        }

        if (userId !== request.interviewerId.toString()) {
          this.logger.warn({
            event: INTERVIEW_REQUEST_MESSAGES.NOT_AUTHORIZED,
            userId,
            requestId,
          });
          throw new ForbiddenError(INTERVIEW_REQUEST_MESSAGES.NOT_AUTHORIZED);
        }

        if (dto.decision === InterviewRequestDecision.REJECTED) {
          const updatedRequest =
            await this.interviewRequestRepository.findOneAndUpdate(
              { _id: request._id.toString() },
              { status: "REJECTED", rejectionReason: dto.rejectionReason },
              session,
            );

          result = {
            request: updatedRequest as IInterviewRequest,
            interview: null,
          };
          return;
        }

        const updatedRequest =
          await this.interviewRequestRepository.findOneAndUpdate(
            { _id: request._id.toString() },
            { status: "ACCEPTED" },
            session,
          );

        const appStage = await this.jobApplicationStageRepository.findById(
          request.jobApplicationStageId.toString(),
          session,
        );
        if (!appStage) {
          this.logger.warn({
            event: APPLICATION_MESSAGES.STAGE_NOT_FOUND,
            jobApplicationStageId: request.jobApplicationStageId,
          });
          throw new NotFoundError(APPLICATION_MESSAGES.STAGE_NOT_FOUND);
        }

        const interviewEntity = InterviewMapper.toInterviewEntity(
          request,
          appStage,
          interviewerProfile.userId as Types.ObjectId,
        );

        const interview = await this.interviewRepository.create(
          interviewEntity,
          session,
        );

        result = { request: updatedRequest as IInterviewRequest, interview };
      });

      return result;
    } finally {
      session.endSession();
    }
  }
  //* get interviews
  async getInterviews(
    userId: string,
    params: GetMyInterviewParams,
  ): Promise<GetMyInterviewsResult> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
    const interviewerProfile = await this.interviewerProfileRepository.findOne({
      userId,
    });
    if (!interviewerProfile) {
      this.logger.warn({
        event: INTERVIEWER_MESSAGES.PROFILE_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(INTERVIEWER_MESSAGES.PROFILE_NOT_FOUND);
    }

    if (
      params.status &&
      !INTERVIEW_STATUS.includes(params.status as InterviewStatus)
    ) {
      this.logger.warn({
        event: INTERVIEW_MESSAGES.INVALID_STATUS,
        status: params.status,
      });
      throw new BadRequestError(INTERVIEW_MESSAGES.INVALID_STATUS);
    }

    const { data, total } =
      await this.interviewRepository.findByInterviewerPaginated(
        new Types.ObjectId(userId),
        params,
      );

    return {
      requests: data,
      total,
      page: params.page,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  }
}
