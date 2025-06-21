import express from "express";
import { json } from "body-parser";
import path from "path";


import indexRoutes from "./routes/index.routes";
import audioRoutes from "./routes/audio.routes";
import renderRoutes from "./routes/render.routes";
import scriptRoutes from "./routes/script.routes";
import captionRoutes from "./routes/caption.routes";
import { errorHandler } from "./middlewares/error.middleware";


export function createApp() {
  const app = express();

  // Middleware
  app.use(json());

  // Static files (served at /audios and /renders)
  app.use("/audios", express.static(path.resolve("public/audios")));
  app.use("/renders", express.static(path.resolve("public/renders")));
  app.use("/scripts", express.static(path.resolve("public/scripts")));
  app.use("/captions" , express.static(path.resolve("public/captions")));
  // Routes
  app.use("/", indexRoutes);
  app.use("/audios", audioRoutes);
  app.use("/renders", renderRoutes);
  app.use("/scripts" , scriptRoutes);
  app.use("/captions" , captionRoutes);

  

//   Global error handler
  app.use(errorHandler);

  return app;
}