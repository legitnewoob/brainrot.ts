// // --- top-level imports  ---------------------------------
// import express from "express";
// import { makeRenderQueue } from "./render-queue";
// import { bundle } from "@remotion/bundler";
// import path from "node:path";
// import { ensureBrowser } from "@remotion/renderer";

// // ⬇️  NEW – bring in the audio helper
// import {
//   createAudioFileFromText,   // returns { id, filePath }
//   AUDIO_DIR                  // directory where MP3s are stored
// } from "../services/audio/tts.mjs";     // adjust path if different
// // --------------------------------------------------------

// const { PORT = 3000, REMOTION_SERVE_URL } = process.env;

// function setupApp({ remotionBundleUrl }: { remotionBundleUrl: string }) {
//   const app = express();

//   const rendersDir = path.resolve("renders");

//   const queue = makeRenderQueue({
//     port: Number(PORT),
//     serveUrl: remotionBundleUrl,
//     rendersDir,
//   });

//   // ➡ Serve finished video renders
//   app.use("/renders", express.static(rendersDir));

//   // ➡ Serve finished audio files (MP3)
//   app.use("/audios", express.static(AUDIO_DIR));

//   // Parse JSON bodies
//   app.use(express.json());

//   // ------------------------------------------------------
//   // HEALTH / WELCOME
//   // ------------------------------------------------------
//   app.get("/", (_req, res) => {
//     res.status(200).json({
//       message:
//         "Hey there, welcome to brainrot-renderer. Ready to get your own brainrot?",
//     });
//   });

//   // ------------------------------------------------------
//   // AUDIO: create an MP3 from text
//   // ------------------------------------------------------
//   app.post("/audios", async (req, res) => {
//     const text: unknown = req.body?.text;

//     if (typeof text !== "string" || !text.trim()) {
//       return res
//         .status(400)
//         .json({ message: "`text` (string) is required in the request body." });
//     }

//     try {
//       // synthesize speech via ElevenLabs
//       const { id } = await createAudioFileFromText(text.trim());

//       // public URL the client can fetch / play
//       const url = `${req.protocol}://${req.get("host")}/audios/${id}.mp3`;

//       res.status(201).json({ id, url });
//     } catch (err) {
//       console.error("Audio generation failed:", err);
//       res.status(500).json({ message: "Audio generation failed." });
//     }
//   });

//   // ------------------------------------------------------
//   // REMOTION QUEUE ENDPOINTS (existing)
//   // ------------------------------------------------------
//   app.post("/renders", (req, res) => {
//     const titleText = req.body?.titleText ?? "Hello, world!";
//     if (typeof titleText !== "string") {
//       return res.status(400).json({ message: "titleText must be a string" });
//     }
//     const jobId = queue.createJob({ titleText });
//     res.json({ jobId });
//   });

//   app.get("/renders/:jobId", (req, res) => {
//     const job = queue.jobs.get(req.params.jobId);
//     res.json(job ?? { message: "Job not found" });
//   });

//   app.delete("/renders/:jobId", (req, res) => {
//     const job = queue.jobs.get(req.params.jobId);
//     if (!job) return res.status(404).json({ message: "Job not found" });

//     if (job.status === "queued" || job.status === "in-progress") {
//       job.cancel();
//       return res.json({ message: "Job cancelled" });
//     }
//     res.status(400).json({ message: "Job is not cancellable" });
//   });

//   return app;
// }

// // ---------------------------------------------------------
// async function main() {
//   await ensureBrowser();

//   const remotionBundleUrl = REMOTION_SERVE_URL
//     ? REMOTION_SERVE_URL
//     : await bundle({
//         entryPoint: path.resolve("remotion/index.ts"),
//         onProgress: (p) => console.info(`Bundling Remotion project: ${p}%`),
//       });

//   const app = setupApp({ remotionBundleUrl });
//   app.listen(PORT, () => console.info(`Server is running on port ${PORT}`));
// }

// main();