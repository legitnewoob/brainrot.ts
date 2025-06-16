import express from "express";
import { json } from "body-parser";
import path from "path";

import indexRoutes from "./routes/index.routes";
import audioRoutes from "./routes/audio.routes";
import renderRoutes from "./routes/render.routes";

import { errorHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  // Middleware
  app.use(json());

  // Static files (served at /audios and /renders)
  app.use("/audios", express.static(path.resolve("public/audios")));
  app.use("/renders", express.static(path.resolve("public/renders")));

  // Routes
  app.use("/", indexRoutes);
  app.use("/audios", audioRoutes);
  app.use("/renders", renderRoutes);

//   Global error handler
  app.use(errorHandler);

  return app;
}