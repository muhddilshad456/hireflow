import { injectable } from "inversify";
import { QueryFilter } from "mongoose";
import {
  CompanyVerificationModel,
  ICompanyVerification,
} from "../../../models/company.verification.model";
import { BaseRepository } from "../../base/implementation/base.repository";
import { ICompanyVerRepository } from "../interface/ICompanyVerRepository";

@injectable()
export class CompanyVerRepository
  extends BaseRepository<ICompanyVerification>
  implements ICompanyVerRepository
{
  constructor() {
    super(CompanyVerificationModel);
  }
  //* find latest verification request
  async findLatestVerificationReq(
    userId: string,
  ): Promise<ICompanyVerification | null> {
    return await CompanyVerificationModel.findOne({ userId }).sort({
      createdAt: -1,
    });
  }
  //* get all verification request
  async getAllVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const filter: QueryFilter<ICompanyVerification> = {};

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status != "all") {
      filter.status = status;
    }

    const [verificationRequests, totalVerificationRequests] = await Promise.all(
      [
        CompanyVerificationModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        CompanyVerificationModel.countDocuments(filter),
      ],
    );

    return { verificationRequests, totalVerificationRequests };
  }
}
