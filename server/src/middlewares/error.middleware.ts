import { Request, Response, NextFunction } from "express";
import { BaseError } from "../errors/base.error.js";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("❌ Error:", err.message);
  console.error("📍 Stack Trace:", err.stack);

  if (err instanceof BaseError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }

  return res
    .status(500)
    .json({ success: false, message: "Internal Server Error" });
};
