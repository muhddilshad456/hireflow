import { injectable } from "inversify";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  IJobApplicationStage,
  JobApplicationStageModel,
} from "../../../models/job-application/job.application.stage.model";
import { IJobApplicationStageRepository } from "../interface/IJobApplicationStageRepository";
import { Types } from "mongoose";
import { INTERVIEW_STAGE_NAMES } from "../../../constants/interview/interview";

@injectable()
export class JobApplicationStageRepository
  extends BaseRepository<IJobApplicationStage>
  implements IJobApplicationStageRepository
{
  constructor() {
    super(JobApplicationStageModel);
  }
  // async findByStageIds(stageIds: string[]): Promise<any> {
  //   return JobApplicationStageModel.find({ jobStageId: { $in: stageIds } })
  //     .populate({
  //       path: "applicationId",
  //       select:
  //         "userId status resumeUrl coverLetter appliedAt offerDetails currentStageId",
  //       populate: {
  //         path: "userId",
  //         select: "_id name email",
  //       },
  //     })
  //     .populate("interviewerId", "name email")
  //     .lean();
  // }
  //* find by stage id paginated
  async findByStageIdPaginated(
    stageId: Types.ObjectId,
    stageName: string,
    {
      search,
      status,
      page,
      limit,
    }: { search?: string; status?: string; page: number; limit: number },
  ): Promise<{ data: any[]; total: number }> {
    const objectStageId =
      typeof stageId === "string" ? new Types.ObjectId(stageId) : stageId;

    const pipeline: any[] = [
      { $match: { jobStageId: objectStageId } },
      {
        $lookup: {
          from: "jobapplications",
          localField: "applicationId",
          foreignField: "_id",
          as: "application",
        },
      },
      { $unwind: { path: "$application", preserveNullAndEmptyArrays: true } },
    ];

    if (status) {
      pipeline.push({ $match: { "application.status": status } });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "application.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    );

    if (search) {
      pipeline.push({
        $match: { "user.name": { $regex: search, $options: "i" } },
      });
    }

    const isInterviewStage = INTERVIEW_STAGE_NAMES.includes(stageName);
    const isOfferStage = stageName === "offer";

    const dataStages: any[] = [
      { $sort: { "application.appliedAt": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    // ---- Only attach interview lookups for interview-type stages ----
    if (isInterviewStage) {
      dataStages.push(
        {
          $lookup: {
            from: "interviewrequests",
            let: { appId: "$applicationId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$jobApplicationId", "$$appId"] },
                      { $eq: ["$jobStageId", objectStageId] },
                    ],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: "latestInterviewRequest",
          },
        },
        {
          $unwind: {
            path: "$latestInterviewRequest",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "interviews",
            let: { appId: "$applicationId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$jobApplicationId", "$$appId"] },
                      { $eq: ["$jobStageId", objectStageId] },
                    ],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: "latestInterview",
          },
        },
        {
          $unwind: {
            path: "$latestInterview",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            resolvedInterviewerId: {
              $ifNull: [
                "$latestInterview.interviewerId",
                "$latestInterviewRequest.interviewerId",
              ],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "resolvedInterviewerId",
            foreignField: "_id",
            as: "interviewerUser",
          },
        },
        {
          $unwind: {
            path: "$interviewerUser",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            interviewProgress: {
              status: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $eq: [
                          { $ifNull: ["$latestInterview.status", null] },
                          "COMPLETED",
                        ],
                      },
                      then: "COMPLETED",
                    },
                    {
                      case: {
                        $eq: [
                          { $ifNull: ["$latestInterview.status", null] },
                          "SCHEDULED",
                        ],
                      },
                      then: "WAITING_FOR_RESULT",
                    },
                    {
                      case: {
                        $eq: [
                          { $ifNull: ["$latestInterviewRequest.status", null] },
                          "PENDING",
                        ],
                      },
                      then: "REQUESTED",
                    },
                    {
                      case: {
                        $eq: [
                          { $ifNull: ["$latestInterviewRequest.status", null] },
                          "REJECTED",
                        ],
                      },
                      then: "REJECTED",
                    },
                  ],
                  default: "NOT_REQUESTED",
                },
              },
              scheduledAt: {
                $ifNull: [
                  "$latestInterview.scheduledAt",
                  "$latestInterviewRequest.scheduledAt",
                ],
              },
              duration: {
                $ifNull: [
                  "$latestInterview.duration",
                  "$latestInterviewRequest.duration",
                ],
              },
              interviewer: {
                $cond: [
                  { $ifNull: ["$interviewerUser._id", false] },
                  {
                    _id: "$interviewerUser._id",
                    name: "$interviewerUser.name",
                    email: "$interviewerUser.email",
                  },
                  null,
                ],
              },
              feedback: "$latestInterview.feedback",
              score: "$latestInterview.score",
              feedbackSubmittedAt: "$latestInterview.feedbackSubmittedAt",
              rejectionReason: "$latestInterviewRequest.rejectionReason",
              interviewRequestId: "$latestInterviewRequest._id",
              interviewId: "$latestInterview._id",
            },
          },
        },
      );
    }

    // ---- Build projection depending on stage type ----
    const baseProjection: any = {
      applicationStageId: "$_id",
      status: 1,
      startedAt: 1,
      completedAt: 1,
      application: {
        _id: "$application._id",
        userId: { _id: "$user._id", name: "$user.name", email: "$user.email" },
        resumeUrl: "$application.resumeUrl",
        coverLetter: "$application.coverLetter",
        status: "$application.status",
        appliedAt: "$application.appliedAt",
        currentStageId: "$application.currentStageId",
      },
    };

    if (isInterviewStage) {
      baseProjection.interviewProgress = 1;
    } else if (isOfferStage) {
      baseProjection.offerLetterUrl = 1;
      baseProjection.offeredSalary = 1;
      baseProjection.joiningDate = 1;
      baseProjection.offerSentAt = 1;
      baseProjection.offerSentBy = 1;
      baseProjection.offerResponse = 1;
      baseProjection.offerRespondedAt = 1;
    } else {
      // resume_review, assessment, document_verification
      baseProjection.feedback = 1;
      baseProjection.reviewedBy = 1;
      baseProjection.reviewedAt = 1;
    }

    dataStages.push({ $project: baseProjection });

    pipeline.push({
      $facet: {
        data: dataStages,
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await JobApplicationStageModel.aggregate(pipeline);
    return {
      data: result[0]?.data ?? [],
      total: result[0]?.totalCount?.[0]?.count ?? 0,
    };
  }
}
