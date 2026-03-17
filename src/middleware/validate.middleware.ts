import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/app-error.js";

export const validate = (schema: ZodSchema) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    return next(new AppError("Validation failed", 422));
  }

  req.body = result.data.body;
  req.params = result.data.params ?? req.params;
  req.query = result.data.query ?? req.query;

  return next();
};
