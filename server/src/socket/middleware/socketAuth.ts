import { NextFunction } from "express";
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { VALIDATION_MESSAGES } from "../../constants/messages/validation";

export interface AuthedSocket extends Socket {
  user?: {
    id: string;
    role: "company_recruiter" | "user" | "company_interviewer";
  };
}

export function socketAuth(socket: AuthedSocket, next: any) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized: Token missing"));
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      userId: string;
      role: "company_recruiter" | "user" | "company_interviewer";
    };

    socket.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error("❌ Socket authentication failed:", error);

    next(new Error(VALIDATION_MESSAGES.UNAUTHORIZED));
  }
}
