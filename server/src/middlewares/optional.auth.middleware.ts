import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types/AuthUser";

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const optionalVerifyAccessToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as AuthUser;
    req.user = decoded;
    next();
  } catch (error: unknown) {
    return res.status(401).json({
      message:
        error instanceof Error ? error.message : "Invalid or expired token",
    });
  }
};
