import { injectable, inject } from "inversify";
import { ICompanyController } from "../interface/ICompanyController";
import { TYPES } from "../../../../../dependency-injection/types";
import { Response, NextFunction } from "express";
import { ICompanyService } from "../../../../../services/v1/company/admin/interface/ICompanyService";
import { ResponseHandler } from "../../../../../utils/responseHandler";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";
import { PROFILE_MESSAGES } from "../../../../../constants/messages/profile";
import { VerificationType } from "../../../../../models/company/company.verification.model";
import { DASHBOARD_MESSAGES } from "../../../../../constants/messages/dashboard/dashboard";
import { UserRole } from "../../../../../constants/roles";
import { INVITATION_MESSAGES } from "../../../../../constants/messages/invitation/invitation";
import { RECRUITER_MESSAGES } from "../../../../../constants/messages/company/recruiter/recruiter";
import { INTERVIEWER_MESSAGES } from "../../../../../constants/messages/company/interviewer/interviewer";

@injectable()
export class CompanyController implements ICompanyController {
  constructor(
    @inject(TYPES.CompanyService) private _companyService: ICompanyService,
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

      const result = await this._companyService.createVerifyRequest(
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
      const result = await this._companyService.getVerificationStatus(
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
      const result = await this._companyService.invite(
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
        await this._companyService.getCompanyProfile(companyAdminId);
      ResponseHandler.success(res, PROFILE_MESSAGES.FETCH_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
  //* get company dashboad detials
  async getDashboard(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      const result = await this._companyService.getDashboard(userId as string);

      ResponseHandler.success(res, DASHBOARD_MESSAGES.FETCHED, result);
    } catch (error) {
      next(error);
    }
  }
  //* get all invitations
  async getAllInvitations(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string)?.toLowerCase() || "";
      const role = req.query.role as UserRole;
      const userId = req?.user?.userId;
      const result = await this._companyService.getAllInvitations(
        page,
        limit,
        search,
        status,
        role,
        userId,
      );
      ResponseHandler.success(
        res,
        INVITATION_MESSAGES.INVITATION_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get all recruiters
  async getRecruiters(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string)?.toLowerCase() || "";
      const userId = req?.user?.userId;
      const result = await this._companyService.getRecruiters(
        page,
        limit,
        search,
        status,
        userId,
      );
      ResponseHandler.success(
        res,
        RECRUITER_MESSAGES.RECRUITERS_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get all interiviewers
  async getInterviewers(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string)?.toLowerCase() || "";
      const userId = req?.user?.userId;
      const result = await this._companyService.getInterviewers(
        page,
        limit,
        search,
        status,
        userId,
      );
      ResponseHandler.success(
        res,
        INTERVIEWER_MESSAGES.INTERVIEWERS_FETCHED,
        result,
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  //* cancel invitation
  async cancelInvitation(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const invitationId = req.params.id as string;
      const userId = req?.user?.userId;
      const result = await this._companyService.cancelInvitation(
        invitationId,
        userId,
      );
      ResponseHandler.success(
        res,
        INVITATION_MESSAGES.INVITATION_CANCELLED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
