export interface ICloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<string>;
}
