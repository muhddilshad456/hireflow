import { HttpStatus } from "../constants/httpStatus";
import { BaseError } from "./base.error";

export class InternalServerError extends BaseError {
  constructor(message = "Internal Server Error") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
