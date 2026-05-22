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
  async createJob(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log("jiklsjdfk");
      const dto = req.body;
      console.log("dto for job creation : ", dto);
      const recruiterId = req.user?.userId;
      console.log("req.user:", req.user);
      console.log("Recruiter ID:", recruiterId);
      const result = await this.recruiterService.createJob(dto, recruiterId);
      ResponseHandler.success(res, "Job created successfully.", result);
    } catch (error) {
      next(error);
    }
  }
}
