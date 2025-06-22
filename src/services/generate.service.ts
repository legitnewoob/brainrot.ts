import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { Request } from "express";
import * as scriptService from "./script.service";
import * as audioService from "./audio.service";
import { handleCaptionJob } from "./caption.service";
import { createRenderJob } from "./render.service";

/**
 * End-to-end pipeline:
 *   1. Make SSML script  → public/scripts/*.txt
 *   2. TTS to MP3        → public/audios/*.mp3
 *   3. Create captions   → public/captions/*.json
 *   4. Queue render job  → render queue using sample-video.mp4
 */
export async function generateFinalProduct(opts: {
  title: string;
  speaker: string;
  req: Express.Request;
}) {
  const { title, speaker, req } = opts;
  const jobId = uuid();

  logStep(jobId, "🚀", "Starting final-product pipeline");
  logStep(jobId, "📝", `Title   : "${title}"`);
  logStep(jobId, "🗣️", `Speaker : "${speaker}"`);

  /* ---------- 1. SCRIPT ---------- */
  logStep(jobId, "✏️", "Generating SSML script (.txt) …");
  const { url: scriptUrl } = await scriptService.createScript(title, speaker, req);
  const scriptPath = toDiskPath(scriptUrl, jobId, "script");
  logStep(jobId, "✅", `Script saved → ${scriptUrl}`);

  const scriptText = await fs.readFile(scriptPath, "utf8");

  /* ---------- 2. AUDIO ---------- */
  logStep(jobId, "🔊", "Synthesising audio (.mp3) with ElevenLabs …");
  const { url: audioUrl } = await audioService.synthesize(scriptText, req, {
    speakerName: speaker,
  });
  const audioPath = toDiskPath(audioUrl, jobId, "audio");
  logStep(jobId, "✅", `Audio saved  → ${audioUrl}`);

  /* ---------- 3. CAPTIONS ---------- */
  logStep(jobId, "💬", "Generating captions (.json) from audio …");
  const { captionPath } = await handleCaptionJob({ audioUrl });
  const captionUrl = toPublicUrl(captionPath);
  logStep(jobId, "✅", `Captions saved → ${captionUrl}`);
  toDiskPath(captionUrl, jobId, "caption"); // Log caption path

  /* ---------- 4. RENDER ---------- */
  logStep(jobId, "🎞️", "Enqueuing render job with v1.mp4 …");
  
// a) video template lives in /public/videos/ but Remotion wants an HTTP URL
const videoUrl = toAbsoluteUrl(req, "/videos/v1.mp4");

// b) audioUrl & captionUrl may still be relative → make them absolute
const audioPublicUrl    = toAbsoluteUrl(req, audioUrl);
const captionPublicUrl  = toAbsoluteUrl(req, captionUrl);

const renderJobId = createRenderJob({
  videoPath:    videoUrl,          // http://localhost:3000/videos/…
  audioPath:    audioPublicUrl,    // http://localhost:3000/audios/…
  captionsPath: captionPublicUrl,  // http://localhost:3000/captions/…
});
logStep(jobId, "📼", `Render job queued → ID: ${renderJobId}`);

  /* ---------- DONE ---------- */
  logStep(jobId, "🏁", "Pipeline complete!");

  return {
    jobId,
    assets: {
      script: scriptUrl,
      audio: audioUrl,
      caption: captionUrl,
      renderJobId,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Pretty logger */
function logStep(jobId: string, icon: string, msg: string) {
  console.log(`${icon} [${jobId}] ${msg}`);
}

function toAbsoluteUrl(req: Request, publicPath: string): string {
  // Already a full URL
  if (/^https?:\/\//i.test(publicPath)) return publicPath;

  const protocol = req.protocol ?? "http";             // fallback for safety
  const host = req.get("host") ?? "localhost:3000";    // fallback for safety

  return `${protocol}://${host}${publicPath}`;
}

/**
 * Convert a public URL (full or relative) to a local filesystem path
 * and log the conversion.
 */
function toDiskPath(publicUrl: string, jobId?: string, label?: string): string {
  const original = publicUrl;

  try {
    publicUrl = new URL(publicUrl).pathname;
  } catch {
    // Already a relative path like /scripts/abc.txt
  }

  const relative = publicUrl.replace(/^\//, "");             // "scripts/abc.txt"
  const resolved = path.resolve("public", relative);         // .../public/scripts/abc.txt

  if (jobId && label) {
    console.log(`🔗 [${jobId}] ${label} path resolve: "${original}" → "${resolved}"`);
  }

  return resolved;
}

/** Convert disk path (absolute) back to public URL (e.g. /captions/foo.json) */
function toPublicUrl(diskPath: string): string {
  const publicDir = path.resolve("public") + path.sep;
  return "/" + path.relative(publicDir, diskPath).replace(/\\/g, "/");
}