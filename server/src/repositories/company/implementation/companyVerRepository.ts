import { injectable } from "inversify";
import { QueryFilter } from "mongoose";
import {
  CompanyVerificationModel,
  ICompanyVerification,
  VerificationType,
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
    type: VerificationType,
  ): Promise<ICompanyVerification | null> {
    return await CompanyVerificationModel.findOne({
      adminId: userId,
      verificationType: type,
    }).sort({
      createdAt: -1,
    });
  }
  //* get all verification request
  async getAllVerificationReq(
    page: number,
    limit: number,
    search: string,
    status: string,
    type: VerificationType,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const filter: QueryFilter<ICompanyVerification> = {};

    filter.verificationType = type;

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
