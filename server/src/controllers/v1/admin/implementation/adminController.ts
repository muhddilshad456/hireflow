import { Request, Response, NextFunction } from "express";
import { TYPES } from "../../../../dependency-injection/types";
import { IAdminService } from "../../../../services/v1/admin/interface/IAdminService";
import { inject } from "inversify";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { IAdminController } from "../interface/IAdminController";
import { VerificationType } from "../../../../models/company.verification.model";

export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.AdminService) private adminService: IAdminService,
  ) {}
  //* get all verification request
  async getAllCompanyVerificationReq(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string)?.toLowerCase() || "";
      const type = req.query.type as VerificationType;
      const result = await this.adminService.getAllCompanyVerificationReq(
        page,
        limit,
        search,
        status,
        type,
      );
      ResponseHandler.success(
        res,
        "company verification requests fetched successfully..",
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get company verification req
  async getCompanyVerificationReq(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const companyVerificationId = req.params.id as string;
      const result = await this.adminService.getCompanyVerificationReq(
        companyVerificationId,
      );
      ResponseHandler.success(
        res,
        "Company verification Request fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* approve company
  async approveCompany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyVerificationId = req.params.id as string;
      const result = await this.adminService.approveCompany(
        companyVerificationId,
      );
      ResponseHandler.success(res, "Company approved successfully.", result);
    } catch (error) {
      next(error);
    }
  }
  //* reject company
  async rejectCompany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const companyVerificationId = req.params.id as string;
      const reason = req.body.reason;
      const result = await this.adminService.rejectCompany(
        companyVerificationId,
        reason,
      );
      ResponseHandler.success(res, "Company rejected successfully.", result);
    } catch (error) {
      next(error);
    }
  }
  //* get all companies
  async getAllCompanies(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";
      const result = await this.adminService.getAllCompanies(
        page,
        limit,
        search,
        status,
      );
      ResponseHandler.success(res, "Companies fetched successfully.", result);
    } catch (error) {
      next(error);
    }
  }
  //* get a company details
  async getCompanyDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.query.id as string;
      const result = await this.adminService.getCompanyDetails(id);
      ResponseHandler.success(
        res,
        "Company details fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
