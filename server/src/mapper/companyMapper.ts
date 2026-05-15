import { ICompanyVerification } from "../models/company.verification.model";

export class CompanyMapper {
  static toCompanyEntity(request: ICompanyVerification) {
    return {
      userId: request.userId,
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
}
