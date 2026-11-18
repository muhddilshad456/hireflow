import { injectable, inject } from "inversify";
import { AuthUser } from "../../../../types/AuthUser";
import { JobFilters } from "../../../../types/jobFilter";
import {
  IJobService,
  JobWithDetailsResult,
  StageCandidatesResult,
} from "../interface/IJobService";
import { PaginatedJobsResult } from "../../../../repositories/job/interface/IJobRepository";
import { IJob } from "../../../../models/job/job.model";
import { IJobApplication } from "../../../../models/job-application/job.application.model";
import { TYPES } from "../../../../dependency-injection/types";
import { IJobRepository } from "../../../../repositories/job/interface/IJobRepository";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { Logger } from "pino";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";
import { UnauthorizedError } from "../../../../errors/unauthorized.error";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { NotFoundError } from "../../../../errors/not-found.error";
import { USER_MESSAGES } from "../../../../constants/messages/user";
import { IJobApplicationRepository } from "../../../../repositories/job-application/interface/IJobApplicationRepository";
import { ConflictError } from "../../../../errors/conflict.error";
import mongoose, { Types } from "mongoose";
import { IJobStageRepository } from "../../../../repositories/job/interface/IJobStageRepository";
import { IJobApplicationStageRepository } from "../../../../repositories/job-application/interface/IJobApplicationStageRepository";
import { ICloudinaryService } from "../../../cloudinary/interface/ICloudinaryService";
import { CLOUDINARY_MESSAGES } from "../../../../constants/messages/cloudinary";
import { InternalServerError } from "../../../../errors/internal-server.error";
import { IJobStage } from "../../../../models/job/job.stage.model";
import { DOCUMENT_VERIFICATION_MESSAGES } from "../../../../constants/messages/docVer";
import { ForbiddenError } from "../../../../errors/forbidden.error";
import { INotificationService } from "../../notification/interface/INotificationService";
import { UserRole } from "../../../../constants/roles";
import { ICompanyRepository } from "../../../../repositories/company/interface/ICompanyRepository";
import { COMPANY_MESSAGES } from "../../../../constants/messages/company";
import { IUserProfileRepository } from "../../../../repositories/profile/interface/IUserProfileRepository";
import { PROFILE_MESSAGES } from "../../../../constants/messages/profile";
import { emitApplicationUpdated } from "../../../../socket/application/applicationrealtime";
import { MyApplicationSummary } from "../../../../interfaces/application/application";
import { IWishlistRepository } from "../../../../repositories/wishlist/interface/IWishlistRepository";
import { IJobWithFavorite } from "../../../../interfaces/job/job";
import { ICounterService } from "../../counter/interface/ICounterService";

@injectable()
export class JobService implements IJobService {
  constructor(
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.JobApplicationRepository)
    private _jobApplicationRepository: IJobApplicationRepository,
    @inject(TYPES.JobStageRepository)
    private _jobStageRepository: IJobStageRepository,
    @inject(TYPES.JobApplicationStageRepository)
    private _jobApplicationStageRepository: IJobApplicationStageRepository,
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.CompanyRepository)
    private _companyRepository: ICompanyRepository,
    @inject(TYPES.UserProfileRepository)
    private _userProfileRepository: IUserProfileRepository,
    @inject(TYPES.WishlistRepository)
    private _wishlistRepository: IWishlistRepository,
    @inject(TYPES.CounterService)
    private _counterService: ICounterService,
    @inject(TYPES.CloudinaryService)
    private _cloudinaryService: ICloudinaryService,
    @inject(TYPES.Logger) private _logger: Logger,
  ) {}
  //* get all jobs
  async getJobs(
    filter: JobFilters,
    user: AuthUser,
  ): Promise<PaginatedJobsResult> {
    const query: JobFilters = { ...filter };

    if (user?.role == "company_recruiter") {
      query.createdBy = user?.userId;
      query.isActive = "Active";
    } else if (user?.role == UserRole.COMPANY_ADMIN) {
      const company = await this._companyRepository.findOne({
        adminId: user?.userId,
      });
      if (!company) {
        this._logger.warn({
          event: COMPANY_MESSAGES.NO_COMPANY_ASSOCIATED,
        });
        throw new BadRequestError(COMPANY_MESSAGES.NO_COMPANY_ASSOCIATED);
      }
      query.company = company._id.toString();
    } else if (user?.role === UserRole.USER) {
      query.isActive = "Active";
      query.status = "OPEN";
    }

    const result = await this._jobRepository.getJobs(query);

    if (user?.role === UserRole.USER && result.data.length > 0) {
      const applications =
        await this._jobApplicationRepository.findByUserAndJobIds(
          user.userId,
          result.data.map((job) => job._id.toString()),
        );

      const myApplicationByJobId = new Map<string, MyApplicationSummary>();
      for (const application of applications) {
        const jobId = application.jobId.toString();
        if (!myApplicationByJobId.has(jobId)) {
          myApplicationByJobId.set(jobId, {
            _id: application._id.toString(),
            status: application.status,
            appliedAt: application.appliedAt,
          });
        }
      }

      return {
        ...result,
        data: result.data.map((job) => ({
          ...job.toObject(),
          application: myApplicationByJobId.get(job._id.toString()) ?? null,
        })),
      };
    }

    return result;
  }
  //* get a job
  async getJob(
    jobId: string,
    user: AuthUser,
  ): Promise<IJobWithFavorite | null> {
    if (!jobId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    const result = await this._jobRepository.getJobDetails(jobId);

    if (!result) {
      return null;
    }

    if (user?.role === UserRole.USER) {
      const wishlist = await this._wishlistRepository.findOne({
        userId: user.userId,
        jobs: new Types.ObjectId(jobId),
      });

      return {
        ...result,
        isFavorite: !!wishlist,
      };
    }

    return result;
  }
  //* update status
  async updateStatus(jobId: string, status: string): Promise<void> {
    if (!jobId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    if (!status) {
      this._logger.warn({
        event: JOB_MESSAGES.JOB_STATUS_REQUIRED,
        jobId,
      });
      throw new BadRequestError(JOB_MESSAGES.JOB_STATUS_REQUIRED);
    }
    await this._jobRepository.updateStatus(jobId, status);
  }
  //* job application
  async applyJob(
    userId: string,
    jobId: string,
    data: { resumeUrl: string; coverLetter?: string },
  ): Promise<IJobApplication> {
    if (!userId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.USER_ID_REQUIRED,
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
    if (!jobId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    if (!data) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.REQUIRED_FIELDS,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.REQUIRED_FIELDS);
    }

    const user = await this._userRepository.findById(userId);
    if (!user) {
      this._logger.warn({
        event: USER_MESSAGES.USER_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      this._logger.warn({
        event: JOB_MESSAGES.JOB_NOT_FOUND,
        jobId,
      });
      throw new NotFoundError(JOB_MESSAGES.JOB_NOT_FOUND);
    }

    const profile = await this._userProfileRepository.findOne({ userId });
    if (!profile || !profile.profileCompleted) {
      this._logger.warn({
        event: PROFILE_MESSAGES.COMPLETE_PROFILE,
        jobId,
      });
      throw new NotFoundError(PROFILE_MESSAGES.COMPLETE_PROFILE);
    }

    const existing = await this._jobApplicationRepository.findOne({
      jobId,
      userId,
    });
    if (existing) {
      this._logger.warn({
        event: JOB_MESSAGES.JOB_ALREADY_APPLIED,
        jobId,
      });
      throw new ConflictError(JOB_MESSAGES.JOB_ALREADY_APPLIED);
    }

    const firstStage = await this._jobStageRepository.findOne({
      jobId,
      order: 1,
    });

    if (!firstStage) {
      throw new ConflictError(JOB_MESSAGES.JOB_STAGE_NOT_FOUND);
    }

    const session = await mongoose.startSession();

    let application: IJobApplication | undefined;

    try {
      application = await session.withTransaction(async () => {
        const applicationNumber = await this._counterService.generateNumber(
          "HF",
          "application",
          session,
        );

        const createdApplication = await this._jobApplicationRepository.create(
          {
            applicationNumber,
            userId: new mongoose.Types.ObjectId(userId),
            jobId: new mongoose.Types.ObjectId(jobId),
            resumeUrl: data.resumeUrl,
            coverLetter: data.coverLetter,
            status: "IN_PROGRESS",
          },
          session,
        );

        const firstApplicationStage =
          await this._jobApplicationStageRepository.create(
            {
              applicationId: createdApplication._id,
              jobStageId: firstStage._id,
              status: "IN_PROGRESS",
              startedAt: new Date(),
            },
            session,
          );

        await this._jobApplicationRepository.update(
          createdApplication._id.toString(),
          {
            currentStageId: firstApplicationStage._id,
          },
          session,
        );

        await this._jobRepository.update(
          jobId,
          { $inc: { applicantsCount: 1 } },
          session,
        );
        return createdApplication;
      });
    } finally {
      await session.endSession();
    }

    if (!application) {
      throw new Error("Failed to create job application");
    }

    emitApplicationUpdated([job.createdBy?.toString()], {
      applicationId: application._id.toString(),
      jobId: job._id.toString(),
      reason: "NEW_APPLICATION_FOR_THE_JOB",
    });

    await this._notificationService.notify(job.createdBy.toString(), {
      type: "JOB APPLICATION",
      title: "New Application",
      message: "New application for the job.",
      link: `/job/${job._id}`,
    });

    return application;
  }
  //* get job with full details
  async getJobWithDetails(jobId: string): Promise<JobWithDetailsResult> {
    if (!jobId) {
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const job = await this._jobRepository.getJobDetails(jobId);
    if (!job) {
      throw new NotFoundError(JOB_MESSAGES.JOB_NOT_FOUND);
    }

    const stages = await this._jobStageRepository.findByJobIdSorted(jobId);

    return {
      job,
      stages: stages.map((s: IJobStage) => ({
        _id: s._id,
        name: s.name,
        order: s.order,
        isMandatory: s.isMandatory,
        isActive: s.isActive,
        documentVerificationDescription:
          s.documentVerificationDescription ?? null,
        assessmentTaskDescription: s.assessmentTaskDescription ?? null,
        assessmentTaskAttachmentUrl: s.assessmentTaskAttachmentUrl ?? null,
      })),
    };
  }
  //* get candidates in each stages of job
  async getStageCandidates(
    jobId: string,
    stageId: string,
    params: { search?: string; status?: string; page: number; limit: number },
  ): Promise<StageCandidatesResult> {
    if (!jobId || !stageId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
        stageId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const stage = await this._jobStageRepository.findById(stageId);

    if (!stage || stage.jobId.toString() !== jobId) {
      this._logger.warn({
        event: JOB_MESSAGES.STAGE_NOT_FOUND,
        jobId,
        stageId,
      });
      throw new NotFoundError(JOB_MESSAGES.STAGE_NOT_FOUND);
    }

    const { data, total } =
      await this._jobApplicationStageRepository.findByStageIdPaginated(
        stage._id,
        stage.name,
        params,
      );

    const stageDetails: Partial<IJobStage> = {
      _id: stage._id,
      name: stage.name,
      order: stage.order,
      isMandatory: stage.isMandatory,
      isActive: stage.isActive,
    };

    if (stage.name === "assessment") {
      stageDetails.assessmentTaskDescription = stage.assessmentTaskDescription;
      stageDetails.assessmentTaskAttachmentUrl =
        stage.assessmentTaskAttachmentUrl;
    }

    if (stage.name == "document_verification") {
      stageDetails.documentVerificationDescription =
        stage.documentVerificationDescription;
    }

    return {
      stage: stageDetails,
      candidates: data,
      total,
      page: params.page,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  }
  //* add assesment task
  async addAssesmentTask(
    jobId: string,
    stageId: string,
    description?: string,
    file?: Express.Multer.File,
  ): Promise<boolean> {
    const start = performance.now();
    if (!jobId || !stageId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
        stageId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    if (!description && !file) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.REQUIRED_FIELDS,
        jobId,
        stageId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.REQUIRED_FIELDS);
    }

    const stage = await this._jobStageRepository.findById(stageId);
    console.log("Stage query:", (performance.now() - start).toFixed(2), "ms");
    if (!stage || stage?.jobId.toString() !== jobId) {
      this._logger.warn({
        event: JOB_MESSAGES.STAGE_NOT_FOUND,
        jobId,
        stageId,
      });
      throw new BadRequestError(JOB_MESSAGES.JOB_STAGE_NOT_FOUND);
    }

    const data: {
      assessmentTaskDescription?: string;
      assessmentTaskAttachmentUrl?: string;
    } = {};

    if (description) data.assessmentTaskDescription = description;

    if (file) {
      try {
        const uploadStart = performance.now();
        const uploaded = await this._cloudinaryService.uploadFile(
          file,
          "assessment-task",
        );
        console.log(
          "Cloudinary upload:",
          (performance.now() - uploadStart).toFixed(2),
          "ms",
        );
        data.assessmentTaskAttachmentUrl = uploaded;
      } catch (error) {
        this._logger.error({
          event: CLOUDINARY_MESSAGES.UPLOAD_FAILED,
          error,
        });
        throw new InternalServerError(CLOUDINARY_MESSAGES.UPLOAD_FAILED);
      }
    }

    const dbStart = performance.now();

    const updated = await this._jobStageRepository.findOneAndUpdate(
      {
        _id: stageId,
        jobId: jobId,
      },
      data,
    );

    console.log(
      "Database update:",
      (performance.now() - dbStart).toFixed(2),
      "ms",
    );

    console.log(
      "Total service time:",
      (performance.now() - start).toFixed(2),
      "ms",
    );

    if (!updated) {
      throw new BadRequestError(JOB_MESSAGES.JOB_STAGE_NOT_FOUND);
    }
    return true;
  }
  //* application status
  async applicationStatus(
    jobId: string,
    userId: string,
  ): Promise<{ isApplied: boolean }> {
    if (!jobId || !userId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
        userId,
      });

      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const application = await this._jobApplicationRepository.findOne({
      userId,
      jobId,
    });

    if (!application) {
      this._logger.info({
        event: JOB_MESSAGES.APPLICATION_NOT_FOUND,
        jobId,
        userId,
      });

      return { isApplied: false };
    }

    return { isApplied: true };
  }
  //* add document verification descreption
  async setDocVerDescription(
    userId: string,
    jobStageId: string,
    description: string,
  ): Promise<string> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const text = typeof description === "string" ? description.trim() : "";
    if (!text)
      throw new BadRequestError(
        DOCUMENT_VERIFICATION_MESSAGES.DESCRIPTION_REQUIRED,
      );
    if (text.length > 1000) {
      throw new BadRequestError(
        DOCUMENT_VERIFICATION_MESSAGES.DESCRIPTION_TOO_LONG,
      );
    }

    const user = await this._userRepository.findById(userId);
    if (!user)
      throw new NotFoundError(DOCUMENT_VERIFICATION_MESSAGES.USER_NOT_FOUND);
    if (user.isBlocked)
      throw new ForbiddenError(DOCUMENT_VERIFICATION_MESSAGES.USER_BLOCKED);
    if (!user.company)
      throw new BadRequestError(DOCUMENT_VERIFICATION_MESSAGES.NO_COMPANY);

    const stage = await this._jobStageRepository.findById(jobStageId);
    if (!stage)
      throw new NotFoundError(DOCUMENT_VERIFICATION_MESSAGES.STAGE_NOT_FOUND);
    if (stage.name !== "document_verification") {
      throw new BadRequestError(
        DOCUMENT_VERIFICATION_MESSAGES.NOT_DOCUMENT_VERIFICATION_STAGE,
      );
    }

    const job = await this._jobRepository.findById(stage.jobId.toString());
    if (!job)
      throw new NotFoundError(DOCUMENT_VERIFICATION_MESSAGES.JOB_NOT_FOUND);
    if (job.company.toString() !== user.company.toString()) {
      this._logger.warn({
        event: DOCUMENT_VERIFICATION_MESSAGES.NOT_AUTHORIZED,
        userId,
        jobStageId,
      });
      throw new ForbiddenError(DOCUMENT_VERIFICATION_MESSAGES.NOT_AUTHORIZED);
    }

    await this._jobStageRepository.findOneAndUpdate(
      { _id: jobStageId },
      { documentVerificationDescription: text },
    );

    return text;
  }
  //* update job status
  async updateJobStatus(
    jobId: string,
    status: "OPEN" | "CLOSED",
    userId: string,
  ): Promise<IJob> {
    if (!jobId) {
      this._logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    if (!status || !["OPEN", "CLOSED"].includes(status)) {
      this._logger.warn({
        event: JOB_MESSAGES.INVALID_JOB_STATUS,
        jobId,
        status,
      });
      throw new BadRequestError(JOB_MESSAGES.INVALID_JOB_STATUS);
    }

    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      this._logger.warn({
        event: JOB_MESSAGES.JOB_NOT_FOUND,
        jobId,
      });
      throw new NotFoundError(JOB_MESSAGES.JOB_NOT_FOUND);
    }

    if (job.createdBy?.toString() != userId) {
      this._logger.warn({
        event: JOB_MESSAGES.INVALID_RECRUITER,
        jobId,
      });
      throw new NotFoundError(JOB_MESSAGES.INVALID_RECRUITER);
    }

    // Resolve company and update job
    const updatedJob = await this._jobRepository.updateJobStatus(jobId, status);

    if (!updatedJob) {
      this._logger.warn({
        event: JOB_MESSAGES.JOB_NOT_FOUND,
        jobId,
      });
      throw new NotFoundError(JOB_MESSAGES.JOB_NOT_FOUND);
    }

    return updatedJob;
  }
}
