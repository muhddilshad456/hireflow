import { Request, Response, NextFunction } from "express";
import { TYPES } from "../../../../dependency-injection/types";
import { IAdminService } from "../../../../services/v1/admin/interface/IAdminService";
import { inject } from "inversify";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { IAdminController } from "../interface/IAdminController";

export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.AdminService) private adminService: IAdminService,
  ) {}
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
      const result = await this.adminService.getAllCompanyVerificationReq(
        page,
        limit,
        search,
        status,
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
}
