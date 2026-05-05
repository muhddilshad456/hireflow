import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IUserService } from "../../../../services/v1/user/interface/IUserService";
import { ResponseHandler } from "../../../../utils/responseHandler";
import { IUserController } from "../interface/IUserController";

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TYPES.UserService) private userService: IUserService) {}
  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";

      const result = await this.userService.getAllUser(
        page,
        limit,
        search,
        status,
      );

      return ResponseHandler.success(res, "Fetched users successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const id = req.params.userId as string;
      const status = req.body.status as string;
      console.log();
      await this.userService.updateStatus(id, status);
      return ResponseHandler.success(res, "Status updated successfully");
    } catch (error) {
      next(error);
    }
  }
}
