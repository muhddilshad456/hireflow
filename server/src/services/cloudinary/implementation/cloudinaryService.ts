import { injectable } from "inversify";
import { cloudinaryInstance } from "../../../config/cloudinary";
import { ICloudinaryService } from "../interface/ICloudinaryService";

@injectable()
export class CloudinaryService implements ICloudinaryService {
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinaryInstance.uploader
        .upload_stream(
          {
            folder,
            resource_type: "auto",
            public_id: Date.now().toString(),
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url || "");
          },
        )
        .end(file.buffer);
    });
  }
}
