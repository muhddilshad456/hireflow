import { HttpStatus } from "../constants/httpStatus";
import { BaseError } from "./base.error";

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized") {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
