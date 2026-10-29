import { injectable } from "inversify";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  IInterview,
  InterviewModel,
} from "../../../models/interview/interview";
import { IInterviewRepository } from "../interface/IInterviewRepository";
import { Types, PipelineStage } from "mongoose";
import {
  GetMyInterviewParams,
  InterviewListItem,
} from "../../../interfaces/interview/interview";

@injectable()
export class InterviewRepository
  extends BaseRepository<IInterview>
  implements IInterviewRepository
{
  constructor() {
    super(InterviewModel);
  }
  async findByInterviewerPaginated(
    interviewerId: Types.ObjectId,
    { search, status, page, limit }: GetMyInterviewParams,
  ): Promise<{ data: InterviewListItem[]; total: number }> {
    const pipeline: PipelineStage[] = [
      { $match: { interviewerId } },

      {
        $lookup: {
          from: "jobapplications",
          localField: "jobApplicationId",
          foreignField: "_id",
          as: "application",
        },
      },
      { $unwind: { path: "$application", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          localField: "application.userId",
          foreignField: "_id",
          as: "candidate",
        },
      },
      { $unwind: { path: "$candidate", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "jobs",
          localField: "application.jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "jobstages",
          localField: "jobStageId",
          foreignField: "_id",
          as: "jobStage",
        },
      },
      { $unwind: { path: "$jobStage", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          localField: "recruiterId",
          foreignField: "_id",
          as: "recruiter",
        },
      },
      { $unwind: { path: "$recruiter", preserveNullAndEmptyArrays: true } },
    ];

    if (status) {
      pipeline.push({ $match: { status } });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "candidate.name": { $regex: search, $options: "i" } },
            { "job.title": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          scheduledAt: 1,
          duration: 1,
          status: 1,
          feedback: 1,
          score: 1,
          feedbackSubmittedAt: 1,
          interviewRequestId: 1,
          createdAt: 1,

          recruiter: {
            _id: "$recruiter._id",
            name: "$recruiter.name",
          },

          jobStage: {
            _id: "$jobStage._id",
            name: "$jobStage.name",
          },

          job: {
            _id: "$job._id",
            title: "$job.title",
          },

          candidate: {
            _id: "$candidate._id",
            name: "$candidate.name",
          },
        },
      },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    );

    const result = await InterviewModel.aggregate(pipeline);

    return {
      data: result[0]?.data ?? [],
      total: result[0]?.totalCount?.[0]?.count ?? 0,
    };
  }
}
