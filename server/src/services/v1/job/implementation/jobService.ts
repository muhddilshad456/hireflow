import { injectable, inject } from "inversify";
import { AuthUser } from "../../../../types/AuthUser";
import { JobFilters } from "../../../../types/jobFilter";
import { IJobService } from "../interface/IJobService";
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
import { IUserProfileRepository } from "../../../../repositories/profile/interface/IUserProfileRepository";
import { IJobApplicationRepository } from "../../../../repositories/job-application/interface/IJobApplicationRepository";
import { ConflictError } from "../../../../errors/conflict.error";
import mongoose from "mongoose";
import { IJobStageRepository } from "../../../../repositories/job/interface/IJobStageRepository";
import { IJobApplicationStageRepository } from "../../../../repositories/job-application/interface/IJobApplicationStageRepository";
import { ICloudinaryService } from "../../../cloudinary/interface/ICloudinaryService";
import { CLOUDINARY_MESSAGES } from "../../../../constants/messages/cloudinary";
import { InternalServerError } from "../../../../errors/internal-server.error";
import { IJobStage } from "../../../../models/job.stage.model";
import app from "../../../../app";

@injectable()
export class JobService implements IJobService {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.JobApplicationRepository)
    private jobApplicationRepository: IJobApplicationRepository,
    @inject(TYPES.UserProfileRepository)
    private userProrfileRepository: IUserProfileRepository,
    @inject(TYPES.JobStageRepository)
    private jobStageRepository: IJobStageRepository,
    @inject(TYPES.JobApplicationStageRepository)
    private jobApplicationStageRepository: IJobApplicationStageRepository,
    @inject(TYPES.CloudinaryService)
    private cloudinaryService: ICloudinaryService,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}
  //* get all jobs
  async getJobs(filter: JobFilters, user: AuthUser): Promise<any> {
    const query: JobFilters = { ...filter };

    if (user?.role == "company_recruiter") {
      query.createdBy = user?.userId;
    }

    const result = await this.jobRepository.getJobs(query);

    return result;
  }
  //* get a job
  async getJob(jobId: string): Promise<any> {
    if (!jobId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    const result = await this.jobRepository.getJobDetails(jobId);
    return result;
  }
  //* update status
  async updateStatus(jobId: string, status: string): Promise<any> {
    if (!jobId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    if (!status) {
      this.logger.warn({
        event: JOB_MESSAGES.JOB_STATUS_REQUIRED,
        jobId,
      });
      throw new BadRequestError(JOB_MESSAGES.JOB_STATUS_REQUIRED);
    }
    await this.jobRepository.updateStatus(jobId, status);
  }
  //* job application
  async applyJob(userId: string, jobId: string, data: any): Promise<any> {
    if (!userId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.USER_ID_REQUIRED,
      });
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
    if (!jobId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    if (!data) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.REQUIRED_FIELDS,
        jobId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.REQUIRED_FIELDS);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn({
        event: USER_MESSAGES.USER_NOT_FOUND,
        userId,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      this.logger.warn({
        event: JOB_MESSAGES.JOB_NOT_FOUND,
        jobId,
      });
      throw new NotFoundError(JOB_MESSAGES.JOB_NOT_FOUND);
    }

    // const profile = await this.userProrfileRepository.findOne({ userId });
    // if (!profile || !profile.profileCompleted) {
    //   this.logger.warn({
    //     event: PROFILE_MESSAGES.COMPLETE_PROFILE,
    //     jobId,
    //   });
    //   throw new NotFoundError(PROFILE_MESSAGES.COMPLETE_PROFILE);
    // }

    const existing = await this.jobApplicationRepository.findOne({
      jobId,
      userId,
    });
    if (existing) {
      this.logger.warn({
        event: JOB_MESSAGES.JOB_ALREADY_APPLIED,
        jobId,
      });
      throw new ConflictError(JOB_MESSAGES.JOB_ALREADY_APPLIED);
    }

    const { resumeUrl, coverLetter } = data;

    const userObjId = new mongoose.Types.ObjectId(userId);
    const jobObjId = new mongoose.Types.ObjectId(jobId);

    const application = await this.jobApplicationRepository.create({
      userId: userObjId,
      jobId: jobObjId,
      resumeUrl,
      coverLetter,
      status: "IN_PROGRESS",
    });

    const firstStage = await this.jobStageRepository.findOne({
      jobId,
      order: 1,
    });
    if (!firstStage) {
      this.logger.warn({
        event: JOB_MESSAGES.JOB_STAGE_NOT_FOUND,
        jobId,
      });
      throw new ConflictError(JOB_MESSAGES.JOB_STAGE_NOT_FOUND);
    }

    const firstApplicationStage =
      await this.jobApplicationStageRepository.create({
        applicationId: application._id,
        jobStageId: firstStage._id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      });

    await this.jobApplicationRepository.update(application._id.toString(), {
      currentStageId: firstApplicationStage._id,
    });

    await this.jobRepository.update(jobId, { $inc: { applicantsCount: 1 } });

    return application;
  }
  //* get job with full details
  async getJobWithDetails(jobId: string): Promise<any> {
    if (!jobId) {
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const job = await this.jobRepository.getJobDetails(jobId);
    if (!job) {
      throw new NotFoundError(JOB_MESSAGES.JOB_NOT_FOUND);
    }

    const stages = await this.jobStageRepository.findByJobIdSorted(jobId);

    return {
      job,
      stages: stages.map((s: IJobStage) => ({
        _id: s._id,
        name: s.name,
        order: s.order,
        isMandatory: s.isMandatory,
        isActive: s.isActive,
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
  ): Promise<any> {
    if (!jobId || !stageId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
        stageId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const stage = await this.jobStageRepository.findById(stageId);

    if (!stage || stage.jobId.toString() !== jobId) {
      this.logger.warn({
        event: JOB_MESSAGES.STAGE_NOT_FOUND,
        jobId,
        stageId,
      });
      throw new NotFoundError(JOB_MESSAGES.STAGE_NOT_FOUND);
    }

    const { data, total } =
      await this.jobApplicationStageRepository.findByStageIdPaginated(
        stage._id,
        params,
      );

    return {
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
    if (!jobId || !stageId) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
        stageId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }
    if (!description && !file) {
      this.logger.warn({
        event: VALIDATION_MESSAGES.REQUIRED_FIELDS,
        jobId,
        stageId,
      });
      throw new BadRequestError(VALIDATION_MESSAGES.REQUIRED_FIELDS);
    }

    let stage = await this.jobStageRepository.findById(stageId);
    if (!stage || stage?.jobId.toString() !== jobId) {
      this.logger.warn({
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
        const uploaded = await this.cloudinaryService.uploadFile(
          file,
          "assessment-task",
        );
        data.assessmentTaskAttachmentUrl = uploaded;
      } catch (error) {
        this.logger.error({
          event: CLOUDINARY_MESSAGES.UPLOAD_FAILED,
          error,
        });
        throw new InternalServerError(CLOUDINARY_MESSAGES.UPLOAD_FAILED);
      }
    }

    const updated = await this.jobStageRepository.findOneAndUpdate(
      {
        _id: stageId,
        jobId: jobId,
      },
      data,
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
      this.logger.warn({
        event: VALIDATION_MESSAGES.ID_REQUIRED,
        jobId,
        userId,
      });

      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const application = await this.jobApplicationRepository.findOne({
      userId,
      jobId,
    });

    if (!application) {
      this.logger.info({
        event: JOB_MESSAGES.APPLICATION_NOT_FOUND,
        jobId,
        userId,
      });

      return { isApplied: false };
    }

    return { isApplied: true };
  }
}
