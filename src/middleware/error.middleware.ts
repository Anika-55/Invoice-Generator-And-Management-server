import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Internal Server Error";

  if (env.NODE_ENV !== "test") {
    logger.error(message, { stack: err.stack });
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
};
