import mongoose from "mongoose";
import { VerificationStatus } from "../../../constants/companyStatus";
import { VerifyReqDto } from "../../../dtos/v1/company/admin/request-dtos/verifyReqDto";

export class CompanyVerificationMapper {
  static toVerificationEntity(
    dto: VerifyReqDto,
    userId: string,
    documentUrl: string,
    profilePictureUrl: string | null,
  ) {
    return {
      adminId: new mongoose.Types.ObjectId(userId),
      companyName: dto.companyName,
      regNumber: dto.regNumber,
      email: dto.email,
      phone: dto.phone,
      website: dto.website,
      description: dto.description,
      address: dto.address,
      country: dto.country,
      state: dto.state,
      city: dto.city,
      zip: dto.zip,
      document: documentUrl,
      profilePicture: profilePictureUrl,
      companyId: new mongoose.Types.ObjectId(dto.companyId),
      verificationType: dto.verificationType,
      status: VerificationStatus.PENDING,
    };
  }
}
