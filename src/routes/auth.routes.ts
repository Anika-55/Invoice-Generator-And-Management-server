import { Router } from "express";
import { z } from "zod";
import {
  forgotPassword,
  login,
  me,
  refresh,
  register,
  resetPasswordWithToken
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    companyName: z.string().min(2)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1)
  })
});

const forgotSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

const resetSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8)
  })
});

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/refresh", validate(refreshSchema), asyncHandler(refresh));
router.post("/forgot-password", validate(forgotSchema), asyncHandler(forgotPassword));
router.post("/reset-password", validate(resetSchema), asyncHandler(resetPasswordWithToken));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
