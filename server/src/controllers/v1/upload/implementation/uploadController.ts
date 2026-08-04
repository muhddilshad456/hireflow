import { Request, Response, NextFunction } from "express";
import { IUploadController } from "../interface/IUploadController";
import { inject } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IUploadService } from "../../../../services/v1/upload/interface/IUploadService";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { CLOUDINARY_MESSAGES } from "../../../../constants/messages/cloudinary";

export class UploadController implements IUploadController {
  constructor(
    @inject(TYPES.UploadService) private uploadService: IUploadService,
  ) {}
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      const result = await this.uploadService.upload(file);
      ResponseHandler.success(res, CLOUDINARY_MESSAGES.UPLOAD_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
}
