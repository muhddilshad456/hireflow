import { injectable, inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { Logger } from "pino";
import { IInterviewService } from "../interface/IInterviewService";
import { CreateInterviewRequestData } from "../../../../interfaces/interview/interviewRequest";
import { IInterviewRequest } from "../../../../models/interview/interview.request";
import { InterviewRequestMapper } from "../../../../mapper/interview/interview-request/InterviewRequestMapper";
import { IInterviewRequestRepository } from "../../../../repositories/interview-request/interface/IInterviewRequestRepository";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { INTERVIEW_REQUEST_MESSAGES } from "../../../../constants/messages/interview/interview-request";
import { APPLICATION_MESSAGES } from "../../../../constants/messages/application/application";
import { NotFoundError } from "../../../../errors/not-found.error";
import { IJobApplicationRepository } from "../../../../repositories/job-application/interface/IJobApplicationRepository";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";
import { IJobStageRepository } from "../../../../repositories/job/interface/IJobStageRepository";
import { INTERVIEW_MESSAGES } from "../../../../constants/messages/interview/interview";
import { ForbiddenError } from "../../../../errors/forbidden.error";
import { RECRUITER_MESSAGES } from "../../../../constants/messages/company/recruiter/recruiter";
import { IJobRepository } from "../../../../repositories/job/interface/IJobRepository";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { ConflictError } from "../../../../errors/conflict.error";
import { IJobApplicationStageRepository } from "../../../../repositories/job-application/interface/IJobApplicationStageRepository";
import { IInterviewerProfileRepository } from "../../../../repositories/profile/interface/IInterviewerProfileRepository";
import {
  GetInterviewDetailsResult,
  JobSubsetInfo,
  UserBasicInfo,
} from "../../../../interfaces/interview/interview";
import { UnauthorizedError } from "../../../../errors/unauthorized.error";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { IInterviewRepository } from "../../../../repositories/interview/interface/IInterviewRepository";
import { IUserProfileRepository } from "../../../../repositories/profile/interface/IUserProfileRepository";
import { IInterview } from "../../../../models/interview/interview";
import { InterviewFeedbackDto } from "../../../../dtos/v1/interview/interviewFeedbackDto ";
import { Types } from "mongoose";
import { INotificationService } from "../../notification/interface/INotificationService";

@injectable()
export class InterviewService implements IInterviewService {
  constructor(
    @inject(TYPES.InterviewRequestRepository)
    private _interviewRequestRepository: IInterviewRequestRepository,
    @inject(TYPES.JobApplicationRepository)
    private _jobApplicationRepository: IJobApplicationRepository,
    @inject(TYPES.JobStageRepository)
    private _jobStageRepository: IJobStageRepository,
    @inject(TYPES.JobRepository)
    private _jobRepository: IJobRepository,
    @inject(TYPES.JobApplicationStageRepository)
    private _jobApplicationStageRepository: IJobApplicationStageRepository,
    @inject(TYPES.UserRepository)
    private _userRepository: IUserRepository,
    @inject(TYPES.InterviewerProfileRepository)
    private _interviewerProfileRepository: IInterviewerProfileRepository,
    @inject(TYPES.InterviewRepository)
    private _interviewRepository: IInterviewRepository,
    @inject(TYPES.UserProfileRepository)
    private _userProfileRepository: IUserProfileRepository,
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.Logger) private _logger: Logger,
  ) {}
  //* create interview request
  async createInterviewRequest(
    recruiterId: string,
    data: CreateInterviewRequestData,
  ): Promise<IInterviewRequest> {
    const scheduledAt = new Date(data.scheduledAt);

    if (scheduledAt <= new Date()) {
      this._logger.warn({
        event: INTERVIEW_REQUEST_MESSAGES.INVALID_INTERVIEW_DATE,
        recruiterId,
      });

      throw new BadRequestError(
        INTERVIEW_REQUEST_MESSAGES.INVALID_INTERVIEW_DATE,
      );
    }

    const jobApplicationStage =
      await this._jobApplicationStageRepository.findById(
        data.jobApplicationStageId,
      );

    if (!jobApplicationStage) {
      this._logger.warn({
        event: JOB_MESSAGES.STAGE_NOT_FOUND,
        jobApplicationStageId: data.jobApplicationStageId,
      });

      throw new NotFoundError(JOB_MESSAGES.STAGE_NOT_FOUND);
    }

    const application = await this._jobApplicationRepository.findById(
      jobApplicationStage.applicationId.toString(),
    );

    if (!application) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.APPLICATION_NOT_FOUND,
        applicationId: jobApplicationStage.applicationId,
      });

      throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
    }

    const stage = await this._jobStageRepository.findById(
      jobApplicationStage.jobStageId.toString(),
    );

    if (!stage) {
      this._logger.warn({
        event: JOB_MESSAGES.STAGE_NOT_FOUND,
        stageId: jobApplicationStage.jobStageId,
      });

      throw new NotFoundError(JOB_MESSAGES.STAGE_NOT_FOUND);
    }

    if (stage.jobId.toString() !== application.jobId.toString()) {
      this._logger.warn({
        event: JOB_MESSAGES.STAGE_NOT_BELONG_TO_APPLICATION,
        stageId: jobApplicationStage.jobStageId,
        applicationId: jobApplicationStage.applicationId,
      });

      throw new BadRequestError(JOB_MESSAGES.STAGE_NOT_BELONG_TO_APPLICATION);
    }

    const INTERVIEW_STAGES = [
      "hr_interview",
      "technical_interview",
      "final_hr_interview",
    ];

    if (!INTERVIEW_STAGES.includes(stage.name)) {
      this._logger.warn({
        event: INTERVIEW_MESSAGES.INVALID_INTERVIEW_STAGE,
        stage: stage.name,
      });

      throw new BadRequestError(INTERVIEW_MESSAGES.INVALID_INTERVIEW_STAGE);
    }

    const recruiterHasAccess = await this._jobRepository.find({
      _id: application.jobId.toString(),
      createdBy: recruiterId,
    });

    if (!recruiterHasAccess) {
      this._logger.warn({
        event: RECRUITER_MESSAGES.RECRUITER_NOT_AUTHORIZED,
        recruiterId,
        jobId: application.jobId,
      });

      throw new ForbiddenError(RECRUITER_MESSAGES.RECRUITER_NOT_AUTHORIZED);
    }

    const interviewerProfile =
      await this._interviewerProfileRepository.findById(data.interviewerId);

    if (!interviewerProfile) {
      this._logger.warn({
        event: INTERVIEW_MESSAGES.INTERVIEWER_NOT_FOUND,
        interviewerId: data.interviewerId,
      });

      throw new NotFoundError(INTERVIEW_MESSAGES.INTERVIEWER_NOT_FOUND);
    }

    const existingRequest = await this._interviewRequestRepository.findOne({
      jobApplicationStageId: data.jobApplicationStageId,
    });

    if (existingRequest) {
      this._logger.warn({
        event: INTERVIEW_REQUEST_MESSAGES.INTERVIEW_REQUEST_ALREADY_EXISTS,
        applicationId: jobApplicationStage.applicationId,
        jobStageId: jobApplicationStage.jobStageId,
      });

      throw new ConflictError(
        INTERVIEW_REQUEST_MESSAGES.INTERVIEW_REQUEST_ALREADY_EXISTS,
      );
    }

    const interviewRequestData =
      InterviewRequestMapper.toNewInterviewRequestEntity(
        {
          jobApplicationStageId: data.jobApplicationStageId,
          interviewerId: interviewerProfile.userId.toString(),
          scheduledAt: data.scheduledAt,
          message: data.message,
        },
        recruiterId,
      );

    const interviewRequest =
      await this._interviewRequestRepository.create(interviewRequestData);

    await this._notificationService.notify(
      interviewRequest?.interviewerId?.toString(),
      {
        type: "INTERVIEW REQUEST",
        title: "New interview request.",
        message: "Your recruiter request for an interview.",
        link: `/interview-requests`,
      },
    );

    return interviewRequest;
  }
  //* get interview details
  async getInterviewDetails(
    userId: string,
    interviewId: string,
  ): Promise<GetInterviewDetailsResult> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const interview = await this._interviewRepository.findById(interviewId);
    if (!interview) {
      this._logger.warn({
        event: INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND,
        interviewId,
      });
      throw new NotFoundError(INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
    }

    const application = await this._jobApplicationRepository.findById(
      interview.jobApplicationId.toString(),
    );
    if (!application) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.APPLICATION_NOT_FOUND,
        jobApplicationId: interview.jobApplicationId,
      });
      throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
    }

    const candidate = await this._userRepository.findByIdSelect(
      application.userId.toString(),
      "name email profilePicture",
    );
    if (!candidate) {
      this._logger.warn({
        event: INTERVIEW_MESSAGES.CANDIDATE_NOT_FOUND,
        userId: application.userId,
      });
      throw new NotFoundError(INTERVIEW_MESSAGES.CANDIDATE_NOT_FOUND);
    }

    // 5. Job — title, description, location, company only
    const job = await this._jobRepository.findByIdSelect(
      application.jobId.toString(),
      "title description location company",
    );
    if (!job) {
      this._logger.warn({
        event: JOB_MESSAGES.JOB_NOT_FOUND,
        jobId: application.jobId,
      });
      throw new NotFoundError(JOB_MESSAGES.JOB_NOT_FOUND);
    }

    const userProfile = await this._userProfileRepository.findOne({
      userId: application.userId,
    });

    // 7. Full job stage details
    const jobStage = await this._jobStageRepository.findById(
      interview.jobStageId.toString(),
    );
    if (!jobStage) {
      this._logger.warn({
        event: JOB_MESSAGES.JOB_STAGE_NOT_FOUND,
        jobStageId: interview.jobStageId,
      });
      throw new NotFoundError(JOB_MESSAGES.JOB_STAGE_NOT_FOUND);
    }

    // 8. Recruiter — name, email, profilePicture only
    const recruiter = await this._userRepository.findByIdSelect(
      interview.recruiterId.toString(),
      "name email profilePicture",
    );
    if (!recruiter) {
      this._logger.warn({
        event: RECRUITER_MESSAGES.RECRUITER_NOT_FOUND,
        recruiterId: interview.recruiterId,
      });
      throw new NotFoundError(RECRUITER_MESSAGES.RECRUITER_NOT_FOUND);
    }

    return {
      interview,
      application,
      candidate: candidate as UserBasicInfo,
      job: job as JobSubsetInfo,
      userProfile: userProfile ?? null,
      jobStage,
      recruiter: recruiter as UserBasicInfo,
    };
  }
  //* submit feedback
  async submitFeedback(
    userId: string,
    interviewId: string,
    dto: InterviewFeedbackDto,
  ): Promise<IInterview> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const interview = await this._interviewRepository.findById(interviewId);
    if (!interview) {
      this._logger.warn({
        event: INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND,
        interviewId,
      });
      throw new NotFoundError(INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
    }

    if (interview.interviewerId.toString() !== userId.toString()) {
      this._logger.warn({
        event: INTERVIEW_MESSAGES.NOT_AUTHORIZED,
        userId,
        interviewId,
      });
      throw new ForbiddenError(INTERVIEW_MESSAGES.NOT_AUTHORIZED);
    }

    if (interview.status === "CANCELLED") {
      this._logger.warn({
        event: INTERVIEW_MESSAGES.CANNOT_SUBMIT_FOR_CANCELLED,
        interviewId,
      });
      throw new BadRequestError(INTERVIEW_MESSAGES.CANNOT_SUBMIT_FOR_CANCELLED);
    }

    const updated = await this._interviewRepository.findOneAndUpdate(
      { _id: interviewId },
      {
        feedback: dto.feedback,
        feedbackSubmittedAt: new Date(),
        status: "COMPLETED",
      },
    );

    return updated as IInterview;
  }
  //* check participant of the coversation
  async isParticipant(
    interviewId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    const interview = await this._interviewRepository.findById(
      interviewId.toString(),
    );
    if (!interview) return false;
    if (!interview.jobApplicationId) return false;
    const application = await this._jobApplicationRepository.findById(
      interview.jobApplicationId.toString(),
    );
    if (!application) return false;
    return (
      interview.interviewerId.equals(userId) ||
      application.userId.equals(userId)
    );
  }
}
