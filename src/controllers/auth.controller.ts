import type { Request, Response } from "express";
import {
  createPasswordReset,
  getCurrentUser,
  loginUser,
  refreshSession,
  registerUser,
  resetPassword
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/app-error.js";

export const register = async (req: Request, res: Response) => {
  const { email, password, name, companyName } = req.body as {
    email: string;
    password: string;
    name: string;
    companyName: string;
  };
  const result = await registerUser(email, password, name, companyName);
  return sendSuccess(res, result, "Registration successful");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await loginUser(email, password);
  return sendSuccess(res, result, "Login successful");
};

export const me = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }
  const user = await getCurrentUser(userId);
  return sendSuccess(res, user, "Current user");
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  const result = await refreshSession(refreshToken);
  return sendSuccess(res, result, "Token refreshed");
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const result = await createPasswordReset(email);
  return sendSuccess(res, result, "If the email exists, a reset link was sent");
};

export const resetPasswordWithToken = async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };
  const result = await resetPassword(token, password);
  return sendSuccess(res, result, "Password reset successful");
};
