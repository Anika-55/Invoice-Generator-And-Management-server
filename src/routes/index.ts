import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import clientRoutes from "./client.routes.js";
import invoiceRoutes from "./invoice.routes.js";

const router = Router();

router.use(healthRoutes);
router.use("/auth", authRoutes);
router.use("/clients", clientRoutes);
router.use("/invoices", invoiceRoutes);

export default router;
