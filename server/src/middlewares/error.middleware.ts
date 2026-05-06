import { NextFunction, Request, Response } from "express";
import { BaseError } from "../errors/base.error.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { HttpStatus } from "../constants/httpStatus.js";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof BaseError) {
    return ResponseHandler.error(
      res,
      err.message,
      err.statusCode,
      err.constructor.name,
    );
  }

  return ResponseHandler.error(
    res,
    "Internal Server Error",
    HttpStatus.INTERNAL_SERVER_ERROR,
    "Internal Server Error",
  );
};
