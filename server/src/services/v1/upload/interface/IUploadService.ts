export interface IUploadService {
  upload(file: Express.Multer.File): Promise<string>;
}
