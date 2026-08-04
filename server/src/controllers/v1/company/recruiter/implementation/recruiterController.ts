import { Request, Response, NextFunction } from "express";
import { IRecruiterController } from "../interface/IRecruiterController";
import { inject } from "inversify";
import { TYPES } from "../../../../../dependency-injection/types";
import { IRecruiterService } from "../../../../../services/v1/company/recruiter/interface/IRecruiterService";
import { AuthRequest } from "../../../../../middlewares/auth.middleware";
import { ResponseHandler } from "../../../../../utils/responseHandler";

export class RecruiterController implements IRecruiterController {
  constructor(
    @inject(TYPES.RecruiterService) private recruiterService: IRecruiterService,
  ) {}
  //* create job
  async createJob(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = req.body;
      const recruiterId = req.user?.userId;
      const result = await this.recruiterService.createJob(dto, recruiterId);
      ResponseHandler.success(res, "Job created successfully.", result);
    } catch (error) {
      next(error);
    }
  }
}
