import { injectable } from "inversify";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  IJobApplicationStage,
  JobApplicationStageModel,
} from "../../../models/job.application.stage.model";
import { IJobApplicationStageRepository } from "../interface/IJobApplicationStageRepository";
import { Types } from "mongoose";

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
      {
        $unwind: {
          path: "$application",
          preserveNullAndEmptyArrays: true,
        },
      },
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

    pipeline.push({
      $facet: {
        data: [
          { $sort: { "application.appliedAt": -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              applicationStageId: "$_id",
              status: 1,
              feedback: 1,
              interviewer: "$interviewerId",
              startedAt: 1,
              completedAt: 1,
              application: {
                _id: "$application._id",
                userId: {
                  _id: "$user._id",
                  name: "$user.name",
                  email: "$user.email",
                },
                resumeUrl: "$application.resumeUrl",
                coverLetter: "$application.coverLetter",
                status: "$application.status",
                appliedAt: "$application.appliedAt",
                currentStageId: "$application.currentStageId",
              },
            },
          },
        ],
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
