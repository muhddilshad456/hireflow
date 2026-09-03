import { inject, injectable } from "inversify";
import { IUploadService } from "../interface/IUploadService";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { TYPES } from "../../../../dependency-injection/types";
import { ICloudinaryService } from "../../../cloudinary/interface/ICloudinaryService";
import { PROFILE_MESSAGES } from "../../../../constants/messages/profile";

@injectable()
export class UploadService implements IUploadService {
  constructor(
    @inject(TYPES.CloudinaryService)
    private cloudinaryService: ICloudinaryService,
  ) {}
  async upload(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestError(PROFILE_MESSAGES.RESUME_REQUIRED);
    }

    const upload = this.cloudinaryService.uploadFile(file, "resume");

    return upload;
  }
}
