import { injectable } from "inversify";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  IInterviewRequest,
  InterviewRequestModel,
} from "../../../models/interview/interview.request";
import { IInterviewRequestRepository } from "../interface/IInterviewRequestRepository";
import { Types, PipelineStage } from "mongoose";
import { InterviewRequestListItem } from "../../../interfaces/interview/interviewRequest";

@injectable()
export class InterviewRequestRepository
  extends BaseRepository<IInterviewRequest>
  implements IInterviewRequestRepository
{
  constructor() {
    super(InterviewRequestModel);
  }
  async findByInterviewerPaginated(
    interviewerProfileId: Types.ObjectId,
    { status, page, limit }: { status?: string; page: number; limit: number },
  ): Promise<{ data: InterviewRequestListItem[]; total: number }> {
    const match: Record<string, unknown> = { interviewerId: interviewerProfileId };
    if (status) {
      match.status = status;
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },

      // requestedBy -> recruiter user
      {
        $lookup: {
          from: "users",
          localField: "requestedBy",
          foreignField: "_id",
          as: "recruiter",
        },
      },
      { $unwind: { path: "$recruiter", preserveNullAndEmptyArrays: true } },

      // jobApplicationStageId -> the stage instance
      {
        $lookup: {
          from: "jobapplicationstages",
          localField: "jobApplicationStageId",
          foreignField: "_id",
          as: "appStage",
        },
      },
      { $unwind: { path: "$appStage", preserveNullAndEmptyArrays: true } },

      // appStage.jobStageId -> stage definition (name)
      {
        $lookup: {
          from: "jobstages",
          localField: "appStage.jobStageId",
          foreignField: "_id",
          as: "jobStage",
        },
      },
      { $unwind: { path: "$jobStage", preserveNullAndEmptyArrays: true } },

      // appStage.applicationId -> the job application (resume, cover letter)
      {
        $lookup: {
          from: "jobapplications",
          localField: "appStage.applicationId",
          foreignField: "_id",
          as: "application",
        },
      },
      { $unwind: { path: "$application", preserveNullAndEmptyArrays: true } },

      // application.userId -> candidate
      {
        $lookup: {
          from: "users",
          localField: "application.userId",
          foreignField: "_id",
          as: "candidate",
        },
      },
      { $unwind: { path: "$candidate", preserveNullAndEmptyArrays: true } },

      // application.jobId -> job
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
        $project: {
          _id: 1,
          scheduledAt: 1,
          duration: 1,
          status: 1,
          rejectionReason: 1,
          createdAt: 1,

          recruiter: {
            _id: "$recruiter._id",
            name: "$recruiter.name",
          },

          jobStage: {
            _id: "$jobStage._id",
            name: "$jobStage.name",
          },

          application: {
            _id: "$application._id",
            resumeUrl: "$application.resumeUrl",
            coverLetter: "$application.coverLetter",
            candidate: {
              _id: "$candidate._id",
              name: "$candidate.name",
            },
            job: {
              _id: "$job._id",
              title: "$job.title",
            },
          },
        },
      },

      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await InterviewRequestModel.aggregate(pipeline);

    return {
      data: result[0]?.data ?? [],
      total: result[0]?.totalCount?.[0]?.count ?? 0,
    };
  }
}
