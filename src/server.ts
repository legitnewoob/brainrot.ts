import { createApp } from "./app";
import { makeRenderQueue } from "./jobs/render-queue";
import { setRenderQueue } from "./services/render.service";
import { ensureBrowser } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import path from "path";

const PORT = process.env.PORT || 3000;

async function start() {
  await ensureBrowser();

    await ensureBrowser();

//   // Inject into service layer
//   setRenderQueue(queue);
  const serveUrl = process.env.REMOTION_SERVE_URL ||
   (await bundle({
    entryPoint: path.resolve("remotion/index.ts"),
    onProgress: (p) => console.info(`Bundling Remotion project: ${p}%`),
  }));

  // Now it’s safe to build the queue
  const queue = makeRenderQueue({
    port: Number(PORT),
    serveUrl,
    rendersDir: path.resolve("public/renders"),
  });

  // Inject into service layer
  setRenderQueue(queue);
  const app = createApp();

  app.listen(PORT, () => {
    console.info(`✅ Server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});