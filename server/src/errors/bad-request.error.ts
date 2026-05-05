import { HttpStatus } from "../constants/httpStatus";
import { BaseError } from "./base.error";

export class BadRequestError extends BaseError {
  constructor(message = "Bad Request") {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
