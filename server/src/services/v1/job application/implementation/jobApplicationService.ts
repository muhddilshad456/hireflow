import { injectable, inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IJobRepository } from "../../../../repositories/job/interface/IJobRepository";
import { VALIDATION_MESSAGES } from "../../../../constants/messages/validation";
import { Logger } from "pino";
import { UnauthorizedError } from "../../../../errors/unauthorized.error";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { IUserProfileRepository } from "../../../../repositories/profile/interface/IUserProfileRepository";
import { IJobApplicationRepository } from "../../../../repositories/job-application/interface/IJobApplicationRepository";
import mongoose, { PipelineStage, Types } from "mongoose";
import { IJobStageRepository } from "../../../../repositories/job/interface/IJobStageRepository";
import { IJobApplicationStageRepository } from "../../../../repositories/job-application/interface/IJobApplicationStageRepository";
import { IJobApplicationService } from "../interface/IJobApplicationService";
import { GetMyApplicationsFilters } from "../../../../interfaces/application/application";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { NotFoundError } from "../../../../errors/not-found.error";
import { APPLICATION_MESSAGES } from "../../../../constants/messages/application";

@injectable()
export class JobApplicationService implements IJobApplicationService {
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
    @inject(TYPES.Logger) private logger: Logger,
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
      await this.jobApplicationRepository.getMyApplicationsAggregate(pipeline);

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
  ): Promise<any> {
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
                interviewerId: "$applicationStage.interviewerId",
                startedAt: "$applicationStage.startedAt",
                completedAt: "$applicationStage.completedAt",
                applicationStageId: "$applicationStage._id",
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
      await this.jobApplicationRepository.getMyApplicationsAggregate(pipeline);

    const application = result?.[0];

    if (!application) {
      throw new NotFoundError(APPLICATION_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return application;
  }
  //* move to next round
  async moveToNextStage(
    applicationId: string,
    feedback?: string,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestError(APPLICATION_MESSAGES.INVALID_APPLICATION_ID);
    }

    const application =
      await this.jobApplicationRepository.findById(applicationId);

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

    const jobStages = await this.jobStageRepository.findByJobIdSorted(
      application.jobId.toString(),
    );

    if (!jobStages.length) {
      throw new NotFoundError(APPLICATION_MESSAGES.NO_STAGES_CONFIGURED);
    }

    if (!application.currentStageId) {
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_MISMATCH);
    }

    // currentStageId points to a JobApplicationStage record, not a JobStage.
    // Fetch that record first, then use its jobStageId to locate position
    // in the ordered jobStages list.
    const currentAppStage = await this.jobApplicationStageRepository.findById(
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

    if (currentJobStage.name === "offer") {
      throw new BadRequestError(APPLICATION_MESSAGES.OFFER_STAGE_MANUAL_ONLY);
    }

    if (currentAppStage.status === "FAILED") {
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_FAILED);
    }

    currentAppStage.status = "PASSED";
    currentAppStage.completedAt = new Date();
    if (feedback !== undefined) {
      currentAppStage.feedback = feedback;
    }
    await this.jobApplicationStageRepository.save(currentAppStage);

    const nextStage = jobStages[currentIndex + 1];

    // No more stages -> finalize application
    if (!nextStage) {
      application.status = "SELECTED";
      application.currentStageId = undefined;
      application.finalizedAt = new Date();
      await this.jobApplicationRepository.save(application);

      return {
        message: APPLICATION_MESSAGES.ALL_STAGES_COMPLETED,
        application,
        nextStage: null,
      };
    }

    // Guard against double-advancement: check if an application-stage
    // record already exists for the next job stage.
    const existingNextStage = await this.jobApplicationStageRepository.findOne({
      applicationId: application._id,
      jobStageId: nextStage._id,
    });

    if (existingNextStage) {
      throw new BadRequestError(APPLICATION_MESSAGES.STAGE_ALREADY_STARTED);
    }

    const nextAppStage = await this.jobApplicationStageRepository.create({
      applicationId: application._id,
      jobStageId: nextStage._id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    });

    // currentStageId now points to the JobApplicationStage record,
    // not the JobStage itself.
    application.currentStageId = nextAppStage._id;
    application.status = "IN_PROGRESS";
    await this.jobApplicationRepository.save(application);

    return {
      message: `${APPLICATION_MESSAGES.MOVED_TO_NEXT_STAGE}: ${nextStage.name}`,
      application,
      nextStage,
      stageRecord: nextAppStage,
    };
  }
}
