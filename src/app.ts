import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { env } from "./config/env.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());

  const corsOrigin = env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN;
  app.use(cors({ origin: corsOrigin, credentials: true }));

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.use("/api", routes);

  app.use(errorHandler);

  return app;
};
