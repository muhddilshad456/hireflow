import { Response } from "express";
import { ApiResponse } from "../types/apiResponse";
import { HttpStatus } from "../constants/httpStatus";

export class ResponseHandler {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = HttpStatus.OK,
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data: data || null,
      error: null,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number,
    error?: string,
  ) {
    const response: ApiResponse = {
      success: false,
      message,
      data: null,
      error: error || null,
    };
    return res.status(statusCode).json(response);
  }
}
