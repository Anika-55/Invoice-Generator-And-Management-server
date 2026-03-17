import { Router } from "express";
import { z } from "zod";
import { login, register } from "../controllers/auth.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

const authSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

router.post("/register", validate(authSchema), asyncHandler(register));
router.post("/login", validate(authSchema), asyncHandler(login));

export default router;
