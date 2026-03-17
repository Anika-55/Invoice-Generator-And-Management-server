import type { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, message = "OK") => {
  return res.json({
    success: true,
    message,
    data
  });
};
