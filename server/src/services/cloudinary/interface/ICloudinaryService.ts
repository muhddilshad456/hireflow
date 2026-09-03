export interface ICloudinaryService {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
}
