import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";
import { inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IJobService } from "../../../../services/v1/job/interface/IJobService";
import { IJobApplicationController } from "../interface/IJobApplicationController";
import { IJobApplicationService } from "../../../../services/v1/job application/interface/IJobApplicationService";
import { APPLICATION_MESSAGES } from "../../../../constants/messages/application/application";
import { DOCUMENT_VERIFICATION_MESSAGES } from "../../../../constants/messages/docVer";
import { BadRequestError } from "../../../../errors/bad-request.error";

const parseExistingDocuments = (raw: unknown): string[] => {
  if (raw === undefined) {
    throw new BadRequestError(
      DOCUMENT_VERIFICATION_MESSAGES.EXISTING_DOCUMENTS_REQUIRED,
    );
  }
  if (typeof raw !== "string") {
    throw new BadRequestError(
      DOCUMENT_VERIFICATION_MESSAGES.EXISTING_DOCUMENTS_INVALID,
    );
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((u) => typeof u !== "string")) {
      throw new Error("not a string array");
    }
    return parsed;
  } catch {
    throw new BadRequestError(
      DOCUMENT_VERIFICATION_MESSAGES.EXISTING_DOCUMENTS_INVALID,
    );
  }
};

export class JobApplicationController implements IJobApplicationController {
  constructor(
    @inject(TYPES.JobService) private _jobService: IJobService,
    @inject(TYPES.JobApplicationService)
    private _jobApplicationService: IJobApplicationService,
  ) {}
  //* get my applications
  async getMyApplications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };
      const userId = req?.user?.userId;

      const result = await this._jobApplicationService.getMyApplications(
        filters,
        userId,
      );
      ResponseHandler.success(res, JOB_MESSAGES.JOBS_FETCHED, result);
    } catch (error) {
      next(error);
    }
  }
  //* get application
  async getMyApplicationDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const applicationId = req.params.applicationId as string;
      const userId = req?.user?.userId;

      const result = await this._jobApplicationService.getMyApplicationDetails(
        applicationId,
        userId,
      );
      ResponseHandler.success(res, JOB_MESSAGES.JOB_FETCHED, result);
    } catch (error) {
      next(error);
    }
  }
  //* update applicaiton stage
  async updateApplicationStage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const appStageId = req.params.appStageId as string;
      const { decision, feedback } = req.body;
      const recruiterId = req.user.userId;

      const result = await this._jobApplicationService.updateApplicationStage(
        appStageId,
        decision,
        feedback,
        recruiterId,
      );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.APPLICATION_STAGE_UPDATED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* move to next stage (bulk)
  async moveMultipleToNextStage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { applicationIds, feedback } = req.body as {
        applicationIds: string[];
        feedback?: string;
      };

      const result = await this._jobApplicationService.moveMultipleToNextStage(
        applicationIds,
        feedback,
      );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.STAGE_UPDATE_SUCCESSFULLY,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* get application stage details
  async getJobApplicationStageDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { applicationId, jobStageId } = req.params;

      const result =
        await this._jobApplicationService.getJobApplicationStageDetails(
          userId,
          applicationId as string,
          jobStageId as string,
        );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.APPLICATION_STAGE_FETCH_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* add or edit assessment resonce
  async addOrEditAssessmentResponse(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { applicationId, jobStageId } = req.params;
      const { text } = req.body;
      const file = req.file;

      const result =
        await this._jobApplicationService.addOrEditAssessmentResponse(
          userId,
          applicationId as string,
          jobStageId as string,
          text,
          file,
        );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.RESPONSE_SAVED_SUCCESS,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* add or remove verificaiton documents
  async updateDocumentsForVerification(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const applicationStageId = req.params?.applicationStageId;
      const keepUrls = parseExistingDocuments(
        req.body?.existingDocuments ?? "[]",
      );
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];

      const documents =
        await this._jobApplicationService.updateDocumentsForVerification(
          userId as string,
          applicationStageId as string,
          keepUrls,
          files,
        );

      ResponseHandler.success(
        res,
        DOCUMENT_VERIFICATION_MESSAGES.DOCUMENTS_UPDATED,
        { documents },
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  //* upload offfer letter
  async uploadOfferLetter(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recruiterId = req.user?.userId;
      const { applicationStageId } = req.params;

      const result = await this._jobApplicationService.uploadOfferLetter(
        applicationStageId as string,
        recruiterId as string,
        req.file,
      );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.OFFER_LETTER_UPLOADED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* update offer response
  async updateOfferResponse(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { applicationStageId } = req.params;
      const { response } = req.body;

      const result = await this._jobApplicationService.updateOfferResponse(
        applicationStageId as string,
        userId as string,
        response,
      );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.OFFER_RESPONSE_SAVED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
  //* withdraw application
  async withdrawApplication(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { applicationId } = req.params;

      const result = await this._jobApplicationService.withdrawApplication(
        applicationId as string,
        userId as string,
      );

      ResponseHandler.success(
        res,
        APPLICATION_MESSAGES.APPLICATION_WITHDRAWN,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
