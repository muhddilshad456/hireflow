import { injectable } from "inversify";
import { BaseRepository } from "../../base/implementation/base.repository";
import {
  IInterviewerProfile,
  InterviewerProfileModel,
} from "../../../models/profiles/interviewer.profile.model";
import { IInterviewerProfileRepository } from "../interface/IInterviewerProfileRepository";
import { Types, PipelineStage } from "mongoose";
import { InterviewerListItem } from "../../../interfaces/interviewer/interviewer";

@injectable()
export class InterviewerProfileRepository
  extends BaseRepository<IInterviewerProfile>
  implements IInterviewerProfileRepository
{
  constructor() {
    super(InterviewerProfileModel);
  }
  async findByCompanyPaginated(
    companyId: Types.ObjectId,
    {
      search,
      capability,
      page,
      limit,
    }: { search?: string; capability?: string; page: number; limit: number },
  ): Promise<{ data: InterviewerListItem[]; total: number }> {
    const objectCompanyId =
      typeof companyId === "string" ? new Types.ObjectId(companyId) : companyId;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          isAvailable: true,
          capabilities: { $exists: true, $ne: [] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
      {
        $match: {
          "user.company": objectCompanyId,
          "user.isBlocked": false,
          "user.role": "company_interviewer",
        },
      },
    ];

    if (capability) {
      pipeline.push({
        $match: {
          capabilities: {
            $elemMatch: { $regex: `^${capability}$`, $options: "i" },
          },
        },
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          "user.name": { $regex: search, $options: "i" },
        },
      });
    }

    pipeline.push({
      $facet: {
        data: [
          { $sort: { "user.name": 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              userId: "$user._id",
              name: "$user.name",
              email: "$user.email",
              profilePicture: "$user.profilePicture",
              capabilities: 1,
              bio: 1,
              isAvailable: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await InterviewerProfileModel.aggregate(pipeline);

    return {
      data: result[0]?.data ?? [],
      total: result[0]?.totalCount?.[0]?.count ?? 0,
    };
  }
}
