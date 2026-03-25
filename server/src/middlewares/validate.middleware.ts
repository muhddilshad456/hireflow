import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateDto =
  (dtoClass: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObject, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.map((err) => ({
          field: err.property,
          constraints: err.constraints,
        })),
      });
    }
    req.body = dtoObject;
    next();
  };
