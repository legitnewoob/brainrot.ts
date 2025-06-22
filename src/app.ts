import express from "express";
import { json } from "body-parser";
import path from "path";
import cors from "cors";

import indexRoutes from "./routes/index.routes";
import audioRoutes from "./routes/audio.routes";
import renderRoutes from "./routes/render.routes";
import scriptRoutes from "./routes/script.routes";
import captionRoutes from "./routes/caption.routes";
import generateRoutes from "./routes/generate.routes";
import { errorHandler } from "./middlewares/error.middleware";


export function createApp() {
  const app = express();

  const API_PREFIX = "/api";

  // Middleware
  app.use(json());

  app.use(
    cors({
      origin: "http://localhost:3001", // for dev; use env var / wildcard as needed
      methods: ["GET", "HEAD"],
    }),
  );

  // Static files (served at /audios and /renders and /videos and /scripts)
  app.use("/audios", express.static(path.resolve("public/audios")));
  app.use("/renders", express.static(path.resolve("public/renders")));
  app.use("/scripts", express.static(path.resolve("public/scripts")));
  app.use("/captions", express.static(path.resolve("public/captions")));
  app.use("/videos", express.static(path.resolve("public/videos")));

  // Routes
  app.use(`${API_PREFIX}/v1`, indexRoutes);
  app.use(`${API_PREFIX}/v1/audios`, audioRoutes);
  app.use(`${API_PREFIX}/v1/renders`, renderRoutes);
  app.use(`${API_PREFIX}/v1/scripts`, scriptRoutes);
  app.use(`${API_PREFIX}/v1/captions`, captionRoutes);
  app.use(`${API_PREFIX}/v1/generate`, generateRoutes);
  //   Global error handler
  app.use(errorHandler);

  return app;
}
