import { Request } from "express";
import { Multer } from "multer";

declare module "express-serve-static-core" {
  interface Request {
    file?: Multer.File;
  }
}
