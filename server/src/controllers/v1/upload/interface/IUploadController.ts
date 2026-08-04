import { Request, Response, NextFunction } from "express";

export interface IUploadController {
  upload(req: Request, res: Response, next: NextFunction): Promise<void>;
}
