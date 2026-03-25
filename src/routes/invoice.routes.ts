import { Router } from "express";
import { z } from "zod";
import { downloadInvoicePdf, sendInvoiceEmail } from "../controllers/invoice.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

const idSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

router.get("/:id/pdf", requireAuth, validate(idSchema), asyncHandler(downloadInvoicePdf));
router.post("/:id/send", requireAuth, validate(idSchema), asyncHandler(sendInvoiceEmail));

export default router;
