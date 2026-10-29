import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { VALIDATION_MESSAGES } from "../../constants/messages/validation";
import { UserRole } from "../../constants/roles";

export interface AuthedSocket extends Socket {
  user?: {
    id: string;
    role: UserRole;
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
      role: UserRole;
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
