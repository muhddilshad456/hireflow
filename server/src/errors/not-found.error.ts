import { HttpStatus } from "../constants/httpStatus";
import { BaseError } from "./base.error";

export class NotFoundError extends BaseError {
  constructor(message = "Resource not found") {
    super(message, HttpStatus.NOT_FOUND);
  }
}
