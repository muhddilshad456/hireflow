import { ICompanyVerification } from "../../../models/company.verification.model";
import { IUser } from "../../../models/user.model";
import { ICompany } from "../../../models/company.model";
import { ProfileResponseDto } from "../../../dtos/v1/company/admin/response-dto/companyProfileDto";
import { IUserWithCompany } from "../../../types/userWithCompany";

export class CompanyMapper {
  static toCompanyEntity(request: ICompanyVerification) {
    return {
      adminId: request.adminId,
      companyName: request.companyName,
      regNumber: request.regNumber,
      email: request.email,
      phone: request.phone,
      website: request.website,
      description: request.description,
      address: request.address,
      country: request.country,
      state: request.state,
      city: request.city,
      zip: request.zip,
      document: request.document,
    };
  }
  static toProfileResponse(
    user: IUserWithCompany,
    company?: ICompany,
  ): ProfileResponseDto {
    return {
      basicDetails: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },

      companyDetails: company
        ? {
            id: company._id.toString(),
            companyName: company.companyName,
            regNumber: company.regNumber,
            email: company.email,
            phone: company.phone,
            website: company.website,
            description: company.description,
            address: company.address,
            country: company.country,
            state: company.state,
            city: company.city,
            zip: company.zip,
            document: company.document,
            isActive: company.isActive,
          }
        : null,
    };
  }
}
