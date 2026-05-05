import { HttpStatus } from "../constants/httpStatus";
import { BaseError } from "./base.error";

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden") {
    super(message, HttpStatus.FORBIDDEN);
  }
}
