import { injectable, inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IJobRepository } from "../../../../repositories/job/interface/IJobRepository";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { Logger } from "pino";
import { UnauthorizedError } from "../../../../errors/unauthorized.error";
import { IJobApplicationRepository } from "../../../../repositories/job-application/interface/IJobApplicationRepository";
import mongoose, { PipelineStage, Types } from "mongoose";
import { IJobStageRepository } from "../../../../repositories/job/interface/IJobStageRepository";
import { IJobApplicationStageRepository } from "../../../../repositories/job-application/interface/IJobApplicationStageRepository";
import { IJobApplicationService } from "../interface/IJobApplicationService";
import {
  ApplicationStageDetailsResult,
  GetMyApplicationsFilters,
  MyApplicationDetailsResult,
  UpdateApplicationStageResult,
} from "../../../../interfaces/application/application";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { NotFoundError } from "../../../../errors/not-found.error";
import { APPLICATION_MESSAGES } from "../../../../constants/messages/application";
import { ConflictError } from "../../../../errors/conflict.error";
import { ForbiddenError } from "../../../../errors/forbidden.error";
import { JobStageName } from "../../../../models/job/job.stage.model";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";
import { IJobApplicationStage } from "../../../../models/job-application/job.application.stage.model";
import { ICloudinaryService } from "../../../cloudinary/interface/ICloudinaryService";
import { InternalServerError } from "../../../../errors/internal-server.error";
import { UPLOAD_MESSAGES } from "../../../../constants/messages/upload";
import { AddAssessmentResponseDto } from "../../../../dtos/v1/application/assessment-responce-dto";
import { ApplicationStageMapper } from "../../../../mapper/application/applicationStageMapper";

@injectable()
export class JobApplicationService implements IJobApplicationService {
  constructor(
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.JobApplicationRepository)
    private _jobApplicationRepository: IJobApplicationRepository,
    @inject(TYPES.JobStageRepository)
    private _jobStageRepository: IJobStageRepository,
    @inject(TYPES.JobApplicationStageRepository)
    private _jobApplicationStageRepository: IJobApplicationStageRepository,
    @inject(TYPES.Logger) private _logger: Logger,
    @inject(TYPES.CloudinaryService)
    private _cloudinaryService: ICloudinaryService,
  ) {}
  //* get my applications
  async getMyApplications(
    filters: GetMyApplicationsFilters,
    userId: string,
  ): Promise<any> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const { search, page, limit } = filters;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 50)); // cap to avoid abuse
    const skip = (safePage - 1) * safeLimit;

    const matchStage: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    const pipeline: PipelineStage[] = [
      { $match: matchStage },

      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
    ];

    if (search && search.trim()) {
      pipeline.push({
        $match: {
          "job.title": { $regex: search.trim(), $options: "i" },
        },
      });
    }

    pipeline.push(
      { $sort: { appliedAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: safeLimit },
            {
              $project: {
                _id: 1,
                status: 1,
                appliedAt: 1,
                resumeUrl: 1,
                coverLetter: 1,
                currentStageId: 1,
                offerDetails: 1,
                "job._id": 1,
                "job.title": 1,
                "job.company": 1,
                "job.location": 1,
                "job.jobType": 1,
                "job.status": 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    );

    const result =
      await this._jobApplicationRepository.getMyApplicationsAggregate(pipeline);

    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount[0]?.count ?? 0;

    return {
      applications: data,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
  //* get my application
  async getMyApplicationDetails(
    applicationId: string,
    userId: string,
  ): Promise<MyApplicationDetailsResult> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestError(VALIDATION_MESSAGES.ID_REQUIRED);
    }

    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(applicationId),
          userId: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },

      {
        $lookup: {
          from: "jobstages",
          let: { jobId: "$jobId", applicationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$jobId", "$$jobId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            { $sort: { order: 1 } },

            {
              $lookup: {
                from: "jobapplicationstages",
                let: { jobStageId: "$_id", applicationId: "$$applicationId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$jobStageId", "$$jobStageId"] },
                          { $eq: ["$applicationId", "$$applicationId"] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: "applicationStage",
              },
            },
            {
              $addFields: {
                applicationStage: { $arrayElemAt: ["$applicationStage", 0] },
              },
            },

            // ---- NEW: interview details for this stage, if one exists ----
            {
              $lookup: {
                from: "interviews",
                let: { jobStageId: "$_id", applicationId: "$$applicationId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$jobStageId", "$$jobStageId"] },
                          { $eq: ["$jobApplicationId", "$$applicationId"] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },

                  // interviewer basic info
                  {
                    $lookup: {
                      from: "users",
                      localField: "interviewerId",
                      foreignField: "_id",
                      as: "interviewer",
                    },
                  },
                  {
                    $unwind: {
                      path: "$interviewer",
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  // recruiter basic info
                  {
                    $lookup: {
                      from: "users",
                      localField: "recruiterId",
                      foreignField: "_id",
                      as: "recruiter",
                    },
                  },
                  {
                    $unwind: {
                      path: "$recruiter",
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  {
                    $project: {
                      _id: 1,
                      scheduledAt: 1,
                      duration: 1,
                      status: 1,
                      feedback: 1,
                      feedbackSubmittedAt: 1,
                      interviewer: {
                        _id: "$interviewer._id",
                        name: "$interviewer.name",
                        email: "$interviewer.email",
                      },
                      recruiter: {
                        _id: "$recruiter._id",
                        name: "$recruiter.name",
                        email: "$recruiter.email",
                      },
                    },
                  },
                ],
                as: "interview",
              },
            },
            {
              $addFields: {
                interview: {
                  $ifNull: [{ $arrayElemAt: ["$interview", 0] }, null],
                },
              },
            },
            // ---- end interview lookup ----

            {
              $project: {
                _id: 1,
                name: 1,
                order: 1,
                isMandatory: 1,
                status: {
                  $ifNull: ["$applicationStage.status", "PENDING"],
                },
                feedback: "$applicationStage.feedback",
                startedAt: "$applicationStage.startedAt",
                completedAt: "$applicationStage.completedAt",
                applicationStageId: "$applicationStage._id",
                interview: 1,
              },
            },
          ],
          as: "stages",
        },
      },

      {
        $project: {
          _id: 1,
          status: 1,
          appliedAt: 1,
          resumeUrl: 1,
          coverLetter: 1,
          currentStageId: 1,
          offerDetails: 1,
          stages: 1,
          job: 1,
        },
      },

      { $limit: 1 },
    ];

    const result =
      await this._jobApplicationRepository.getMyApplicationsAggregate(pipeline);

    const application = result?.[0];

    if (!application) {
      throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return application;
  }
  //* helper (stage move)
  private async moveApplicationToNextStage(
    applicationId: string,
    feedback?: string,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestError(APPLICATION_MESSAGES.INVALID_APPLICATION_ID);
    }

    const application =
      await this._jobApplicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
    }

    const terminalStatuses = [
      "REJECTED",
      "WITHDRAWN",
      "SELECTED",
      "OFFER_SENT",
    ];
    if (terminalStatuses.includes(application.status)) {
      throw new BadRequestError(
        `${APPLICATION_MESSAGES.APPLICATION_ALREADY_FINALIZED} (${application.status})`,
      );
    }

    const jobStages = await this._jobStageRepository.findByJobIdSorted(
      application.jobId.toString(),
    );

    if (!jobStages.length) {
      throw new NotFoundError(APPLICATION_MESSAGES.NO_STAGES_CONFIGURED);
    }

    if (!application.currentStageId) {
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_MISMATCH);
    }

    const currentAppStage = await this._jobApplicationStageRepository.findById(
      application.currentStageId.toString(),
    );

    if (!currentAppStage) {
      throw new BadRequestError(
        APPLICATION_MESSAGES.CURRENT_STAGE_RECORD_MISSING,
      );
    }

    const currentIndex = jobStages.findIndex((s: any) =>
      s._id.equals(currentAppStage.jobStageId),
    );

    if (currentIndex === -1) {
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_MISMATCH);
    }

    const currentJobStage = jobStages[currentIndex];

    console.log("current app stage : ", currentAppStage);

    if (currentJobStage.name === "offer") {
      throw new BadRequestError(APPLICATION_MESSAGES.OFFER_STAGE_MANUAL_ONLY);
    }

    if (currentAppStage.status === "PASSED") {
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_ALREADY_PASSED);
    }

    if (currentAppStage.status === "FAILED") {
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_FAILED);
    }

    currentAppStage.status = "PASSED";
    currentAppStage.completedAt = new Date();
    if (feedback !== undefined) {
      currentAppStage.feedback = feedback;
    }
    await this._jobApplicationStageRepository.save(currentAppStage);

    const nextStage = jobStages[currentIndex + 1];

    if (!nextStage) {
      application.status = "SELECTED";
      application.currentStageId = undefined;
      application.finalizedAt = new Date();
      await this._jobApplicationRepository.save(application);

      return {
        message: APPLICATION_MESSAGES.ALL_STAGES_COMPLETED,
        application,
        nextStage: null,
      };
    }

    const existingNextStage = await this._jobApplicationStageRepository.findOne(
      {
        applicationId: application._id,
        jobStageId: nextStage._id,
      },
    );

    if (existingNextStage) {
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_ALREADY_STARTED);
    }

    const nextAppStage = await this._jobApplicationStageRepository.create({
      applicationId: application._id,
      jobStageId: nextStage._id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    });

    application.currentStageId = nextAppStage._id;
    application.status = "IN_PROGRESS";
    await this._jobApplicationRepository.save(application);

    return {
      message: `${APPLICATION_MESSAGES.MOVED_TO_NEXT_STAGE}: ${nextStage.name}`,
      application,
      nextStage,
      stageRecord: nextAppStage,
    };
  }
  //* update application stage
  async updateApplicationStage(
    appStageId: string,
    decision: string,
    feedback: string | undefined,
    recruiterId: string,
  ): Promise<UpdateApplicationStageResult> {
    if (!decision) {
      this._logger.warn({ event: APPLICATION_MESSAGES.DECISION_REQUIRED });
      throw new BadRequestError(APPLICATION_MESSAGES.DECISION_REQUIRED);
    }

    if (decision !== "PASSED" && decision !== "FAILED") {
      this._logger.warn({ event: APPLICATION_MESSAGES.INVALID_DECISION });
      throw new BadRequestError(APPLICATION_MESSAGES.INVALID_DECISION);
    }

    const session = await mongoose.startSession();

    try {
      let result: any;

      await session.withTransaction(async () => {
        const currentAppStage =
          await this._jobApplicationStageRepository.findById(
            appStageId,
            session,
          );

        if (!currentAppStage) {
          this._logger.warn({
            event: APPLICATION_MESSAGES.STAGE_NOT_FOUND,
            appStageId,
          });
          throw new NotFoundError(APPLICATION_MESSAGES.STAGE_NOT_FOUND);
        }

        if (currentAppStage.status !== "IN_PROGRESS") {
          this._logger.warn({
            event: APPLICATION_MESSAGES.STAGE_ALREADY_ACTIONED,
            appStageId,
          });
          throw new ConflictError(APPLICATION_MESSAGES.STAGE_ALREADY_ACTIONED);
        }

        const application = await this._jobApplicationRepository.findById(
          currentAppStage.applicationId.toString(),
          session,
        );

        if (!application) {
          this._logger.warn({
            event: APPLICATION_MESSAGES.APPLICATION_NOT_FOUND,
            applicationId: currentAppStage.applicationId,
          });
          throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
        }

        if (application.status !== "IN_PROGRESS") {
          this._logger.warn({
            event: APPLICATION_MESSAGES.APPLICATION_NOT_IN_PROGRESS,
            applicationId: application._id,
          });
          throw new BadRequestError(
            APPLICATION_MESSAGES.APPLICATION_NOT_IN_PROGRESS,
          );
        }

        if (
          application.currentStageId?.toString() !==
          currentAppStage._id.toString()
        ) {
          this._logger.warn({
            event: APPLICATION_MESSAGES.STAGE_OUT_OF_SYNC,
            appStageId,
          });
          throw new ConflictError(APPLICATION_MESSAGES.STAGE_OUT_OF_SYNC);
        }

        const job = await this._jobRepository.findById(
          application.jobId.toString(),
          session,
        );

        if (!job) {
          this._logger.warn({
            event: APPLICATION_MESSAGES.JOB_NOT_FOUND,
            jobId: application.jobId,
          });
          throw new NotFoundError(APPLICATION_MESSAGES.JOB_NOT_FOUND);
        }

        if (job.createdBy.toString() !== recruiterId.toString()) {
          this._logger.warn({
            event: APPLICATION_MESSAGES.NOT_AUTHORIZED,
            recruiterId,
            jobId: job._id,
          });
          throw new ForbiddenError(APPLICATION_MESSAGES.NOT_AUTHORIZED);
        }

        const currentJobStage = await this._jobStageRepository.findById(
          currentAppStage.jobStageId.toString(),
          session,
        );

        if (!currentJobStage) {
          this._logger.warn({
            event: APPLICATION_MESSAGES.JOB_STAGE_NOT_FOUND,
            jobStageId: currentAppStage.jobStageId,
          });
          throw new NotFoundError(APPLICATION_MESSAGES.JOB_STAGE_NOT_FOUND);
        }

        if (currentJobStage.name === ("offer" as JobStageName)) {
          this._logger.warn({
            event: APPLICATION_MESSAGES.OFFER_STAGE_NOT_ALLOWED,
          });
          throw new BadRequestError(
            APPLICATION_MESSAGES.OFFER_STAGE_NOT_ALLOWED,
          );
        }

        await this._jobApplicationStageRepository.findOneAndUpdate(
          { _id: currentAppStage._id.toString() },
          {
            status: decision,
            feedback,
            reviewedBy: recruiterId,
            reviewedAt: new Date(),
            completedAt: new Date(),
          },
          session,
        );

        if (decision === "FAILED") {
          const updatedApplication =
            await this._jobApplicationRepository.findOneAndUpdate(
              application._id.toString(),
              { status: "REJECTED", finalizedAt: new Date() },
              session,
            );

          result = {
            application: updatedApplication,
            stageId: currentAppStage._id,
            nextStage: null,
          };
          return;
        }

        const nextJobStage = await this._jobStageRepository.findOne(
          { jobId: job._id.toString(), order: currentJobStage.order + 1 },
          session,
        );

        if (!nextJobStage) {
          const updatedApplication =
            await this._jobApplicationRepository.findOneAndUpdate(
              application._id.toString(),
              {
                currentStageId: null,
                status: "SELECTED",
                finalizedAt: new Date(),
              },
              session,
            );

          result = {
            application: updatedApplication,
            stageId: currentAppStage._id,
            nextStage: null,
          };
          return;
        }

        const newAppStage = await this._jobApplicationStageRepository.create(
          {
            applicationId: application._id,
            jobStageId: nextJobStage._id,
            status: "IN_PROGRESS",
            startedAt: new Date(),
          },
          session,
        );

        const updatedApplication =
          await this._jobApplicationRepository.findOneAndUpdate(
            { _id: application._id.toString() },
            { currentStageId: newAppStage._id },
            session,
          );

        result = {
          application: updatedApplication,
          stageId: currentAppStage._id,
          nextStage: newAppStage,
        };
      });

      return result;
    } catch (error) {
      console.error(">>> updateApplicationStage ERROR:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }
  //* move to next round (bulk)
  async moveMultipleToNextStage(
    applicationIds: string[],
    feedback?: string,
  ): Promise<{
    succeeded: { applicationId: string; nextStage: any }[];
    failed: { applicationId: string; reason: string }[];
  }> {
    const succeeded: { applicationId: string; nextStage: any }[] = [];
    const failed: { applicationId: string; reason: string }[] = [];

    for (const applicationId of applicationIds) {
      try {
        const result = await this.moveApplicationToNextStage(
          applicationId,
          feedback,
        );
        succeeded.push({ applicationId, nextStage: result.nextStage });
      } catch (error: any) {
        failed.push({
          applicationId,
          reason: error?.message ?? "Failed to move application",
        });
      }
    }

    return { succeeded, failed };
  }
  //* get application stage details
  async getJobApplicationStageDetails(
    userId: string,
    applicationId: string,
    jobStageId: string,
  ): Promise<ApplicationStageDetailsResult> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const application =
      await this._jobApplicationRepository.findById(applicationId);
    if (!application) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.APPLICATION_NOT_FOUND,
        applicationId,
      });
      throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
    }

    // Only the candidate who owns this application can view it
    if (application.userId.toString() !== userId.toString()) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.NOT_AUTHORIZED,
        userId,
        applicationId,
      });
      throw new ForbiddenError(APPLICATION_MESSAGES.NOT_AUTHORIZED);
    }

    const jobStage = await this._jobStageRepository.findById(jobStageId);
    if (!jobStage) {
      this._logger.warn({
        event: JOB_MESSAGES.STAGE_NOT_FOUND,
        jobStageId,
      });
      throw new NotFoundError(JOB_MESSAGES.STAGE_NOT_FOUND);
    }

    // Sanity check: this jobStage must actually belong to this application's job
    if (jobStage.jobId.toString() !== application.jobId.toString()) {
      this._logger.warn({
        event: JOB_MESSAGES.STAGE_NOT_BELONG_TO_APPLICATION,
        jobStageId,
        applicationId,
      });
      throw new BadRequestError(JOB_MESSAGES.STAGE_NOT_BELONG_TO_APPLICATION);
    }

    // May be null if the candidate hasn't reached this stage yet (lazy creation)
    const applicationStage = await this._jobApplicationStageRepository.findOne({
      applicationId,
      jobStageId,
    });

    return { jobStage, applicationStage: applicationStage ?? null };
  }
  //* add or edit assessment resonce
  async addOrEditAssessmentResponse(
    userId: string,
    applicationId: string,
    jobStageId: string,
    text: string | undefined,
    file: Express.Multer.File | undefined,
  ): Promise<IJobApplicationStage> {
    if (!userId) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }

    const application =
      await this._jobApplicationRepository.findById(applicationId);
    if (!application) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.APPLICATION_NOT_FOUND,
        applicationId,
      });
      throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
    }

    if (application.userId.toString() !== userId.toString()) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.NOT_AUTHORIZED,
        userId,
        applicationId,
      });
      throw new ForbiddenError(APPLICATION_MESSAGES.NOT_AUTHORIZED);
    }

    const jobStage = await this._jobStageRepository.findById(jobStageId);
    if (!jobStage) {
      this._logger.warn({
        event: JOB_MESSAGES.JOB_STAGE_NOT_FOUND,
        jobStageId,
      });
      throw new NotFoundError(JOB_MESSAGES.JOB_STAGE_NOT_FOUND);
    }

    if (jobStage.jobId.toString() !== application.jobId.toString()) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.STAGE_MISMATCH,
        jobStageId,
        applicationId,
      });
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_MISMATCH);
    }

    if (jobStage.name !== "assessment") {
      this._logger.warn({
        event: APPLICATION_MESSAGES.NOT_ASSESSMENT_STAGE,
        jobStageId,
      });
      throw new BadRequestError(APPLICATION_MESSAGES.NOT_ASSESSMENT_STAGE);
    }

    if (!jobStage.assessmentTaskDescription) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.TASK_NOT_ADDED,
        jobStageId,
      });
      throw new BadRequestError(APPLICATION_MESSAGES.TASK_NOT_ADDED);
    }

    const applicationStage = await this._jobApplicationStageRepository.findOne({
      applicationId,
      jobStageId,
    });
    if (!applicationStage) {
      this._logger.warn({
        event: APPLICATION_MESSAGES.STAGE_NOT_FOUND,
        applicationId,
        jobStageId,
      });
      throw new NotFoundError(APPLICATION_MESSAGES.STAGE_NOT_FOUND);
    }

    // Once the recruiter has passed/failed this stage, lock further edits
    if (applicationStage.status !== "IN_PROGRESS") {
      this._logger.warn({
        event: APPLICATION_MESSAGES.STAGE_NOT_EDITABLE,
        applicationStageId: applicationStage._id,
      });
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_NOT_EDITABLE);
    }

    // Keep the existing attachment unless a new file is uploaded with this edit
    let attachmentUrl = applicationStage.assessmentResponseAttachmentUrl;

    if (file) {
      let uploaded;
      try {
        uploaded = await this._cloudinaryService.uploadFile(
          file,
          "assessment-response",
        );
      } catch (error) {
        throw new InternalServerError(UPLOAD_MESSAGES.UPLOAD_FAILED);
      }
      attachmentUrl = uploaded;
    }

    const dto: AddAssessmentResponseDto = { text };

    if (!text && !attachmentUrl) {
      throw new BadRequestError(APPLICATION_MESSAGES.RESPONSE_REQUIRED);
    }

    const entity = ApplicationStageMapper.toAssessmentResponseEntity(
      dto,
      attachmentUrl,
    );

    const updated = await this._jobApplicationStageRepository.findOneAndUpdate(
      { _id: applicationStage._id.toString() },
      entity,
    );

    return updated as IJobApplicationStage;
  }
}
