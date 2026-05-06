import { injectable, inject } from "inversify";
import { ICompanyController } from "../interface/ICompanyController";
import { TYPES } from "../../../../dependency-injection/types";
import { Response, NextFunction } from "express";
import { ICompanyService } from "../../../../services/v1/company/interface/ICompanyService";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

@injectable()
export class CompanyController implements ICompanyController {
  constructor(
    @inject(TYPES.CompanyService) private companyService: ICompanyService,
  ) {}
  async createVerifyRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const dto = req.body;
      const file = req.file;

      const result = await this.companyService.createVerifyRequest(
        userId,
        dto,
        file,
      );

      ResponseHandler.success(res, "Verification Request Submitted", result);
    } catch (error) {
      next(error);
    }
  }
}
