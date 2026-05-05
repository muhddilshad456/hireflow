import { HttpStatus } from "../constants/httpStatus";
import { BaseError } from "./base.error";

export class ConflictError extends BaseError {
  constructor(message = "Conflict") {
    super(message, HttpStatus.CONFLICT);
  }
}
