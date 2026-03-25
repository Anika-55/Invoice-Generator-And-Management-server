import { Router } from "express";
import { z } from "zod";
import {
  create,
  getById,
  list,
  removeById,
  updateById
} from "../controllers/client.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

const createSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(3).optional(),
    address: z.string().min(3).optional()
  })
});

const updateSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(3).optional(),
    address: z.string().min(3).optional()
  })
});

const idSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  })
});

router.use(requireAuth);

router.post("/", validate(createSchema), asyncHandler(create));
router.get("/", validate(listSchema), asyncHandler(list));
router.get("/:id", validate(idSchema), asyncHandler(getById));
router.put("/:id", validate(updateSchema), asyncHandler(updateById));
router.delete("/:id", validate(idSchema), asyncHandler(removeById));

export default router;
