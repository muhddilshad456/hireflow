import { Request, Response, NextFunction } from "express";

export interface ICompanyController {
  createVerifyRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any>;
}
