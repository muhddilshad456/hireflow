import { injectable, inject } from "inversify";
import { ICompanyController } from "../interface/ICompanyController";
import { TYPES } from "../../../../../dependency-injection/types";
import { Response, NextFunction, Request } from "express";
import { ICompanyService } from "../../../../../services/v1/company/admin/interface/ICompanyService";
import { ResponseHandler } from "../../../../../utils/responseHandler";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";
import { PROFILE_MESSAGES } from "../../../../../constants/messages/profile";
import { VerificationType } from "../../../../../models/company.verification.model";

@injectable()
export class CompanyController implements ICompanyController {
  constructor(
    @inject(TYPES.CompanyService) private companyService: ICompanyService,
  ) {}
  //* create verify request
  async createVerifyRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const dto = req.body;
      const files = req.files as {
        document?: Express.Multer.File[];
        profilePicture?: Express.Multer.File[];
      };

      const result = await this.companyService.createVerifyRequest(
        userId,
        dto,
        files,
      );

      ResponseHandler.success(res, "Verification Request Submitted", result);
    } catch (error) {
      next(error);
    }
  }
  //* get verification status
  async getVerificationStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const type = req.query?.type?.toString() as VerificationType;
      const result = await this.companyService.getVerificationStatus(
        userId,
        type,
      );
      ResponseHandler.success(
        res,
        "Company status fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* invite
  async invite(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyAdminId = req.user.userId;
      const { name, email, role } = req.body;
      const result = await this.companyService.invite(
        name,
        email,
        role,
        companyAdminId,
      );
      console.log(`result : ${result}`);
      ResponseHandler.success(res, "Invitation send successfully.", result);
    } catch (error) {
      next(error);
    }
  }

  //* profile
  async getCompanyProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyAdminId = req.user.userId;
      const result =
        await this.companyService.getCompanyProfile(companyAdminId);
      ResponseHandler.success(res, PROFILE_MESSAGES.FETCH_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
}
