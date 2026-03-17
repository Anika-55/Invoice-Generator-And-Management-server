import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await registerUser(email, password);
  return sendSuccess(res, result, "Registration successful");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await loginUser(email, password);
  return sendSuccess(res, result, "Login successful");
};
