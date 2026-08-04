import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.util";

export const validateDto =
  (dtoClass: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToInstance(dtoClass, req.body || {});
    const errors = await validate(dtoObject, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      const formattedErrors = errors.map((err) => ({
        field: err.property,
        messages: Object.values(err.constraints || {}),
      }));

      logger.error(
        {
          route: req.originalUrl,
          method: req.method,
          body: req.body,
          validationErrors: formattedErrors,
        },
        "DTO validation failed",
      );

      return res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    req.body = dtoObject;
    next();
  };
