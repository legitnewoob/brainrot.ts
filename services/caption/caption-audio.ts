// src/services/caption/caption-audio.ts
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  mkdtempSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path, { basename, extname } from "node:path";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import https from "node:https";
import http from "node:http";

import {
  WHISPER_LANG,
  WHISPER_MODEL,
  WHISPER_PATH,
  WHISPER_VERSION,
} from "../../whisper-config.mjs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

// ─── internal helpers ────────────────────────────────────────────────────────
// async function download(url: string, outputPath: string) {
//   const client = url.startsWith("https") ? https : http;
//   await pipeline(
//     client.get(url, { headers: { "User-Agent": "caption-script/1.0" } }),
//     createWriteStream(outputPath),
//   );
// }

async function download(url: string, outputPath: string) {
  const client = url.startsWith("https") ? https : http;

  // Wrap the download logic in a Promise to get the response stream
  const readable = await new Promise<http.IncomingMessage>((resolve, reject) => {
    client.get(url, { headers: { "User-Agent": "caption-script/1.0" } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode} ${res.statusMessage}`));
      } else {
        resolve(res);
      }
    }).on("error", reject);
  });
  console.log("🔽 Downloading:", url);
  console.log("💾 Saving to:", outputPath);
  // Pipe the readable stream into the write stream
  await pipeline(readable, createWriteStream(outputPath));
}

function convertToWav(input: string, workDir: string): string {
  const out = path.join(workDir, `${basename(input, extname(input))}.wav`);
  execSync(
    `npx remotion ffmpeg -i "${input}" -ar 16000 -ac 1 "${out}" -y`,
    { stdio: ["ignore", "inherit"] },
  );
  return out;
}

async function prepareWhisper() {
  await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
  await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────
export interface CaptionOptions {
  input: string;                  // local file path OR http(s) url   (required)
  outDir?: string;                // defaults to "<repo>/public/captions"
  model?: string;                 // override WHISPER_MODEL
  language?: string;              // override WHISPER_LANG
}

export async function captionAudio(opts: CaptionOptions) {
  await prepareWhisper();

  const {
    input,
    outDir = path.join(process.cwd(), "public", "captions"),
    model = WHISPER_MODEL,
    language = WHISPER_LANG,
  } = opts;

  const workDir = mkdtempSync(path.join(tmpdir(), "caption-"));
  let localAudioPath = input;

  // 1) Remote download if needed
  if (/^https?:\/\//i.test(input)) {
    const downloadPath = path.join(
      workDir,
      basename(new URL(input).pathname) || "audio",
    );
    await download(input, downloadPath);
    localAudioPath = downloadPath;
  }
  if (!existsSync(localAudioPath)) {
    throw new Error(`Input file not found: ${localAudioPath}`);
  }

  // 2) Convert to wav if required
  const wavPath =
    extname(localAudioPath).toLowerCase() === ".wav"
      ? localAudioPath
      : convertToWav(localAudioPath, workDir);

  // 3) Transcription
  const whisperOutput = await transcribe({
    inputPath: wavPath,
    model,
    tokenLevelTimestamps: true,
    whisperPath: WHISPER_PATH,
    whisperCppVersion: WHISPER_VERSION,
    printOutput: false,
    translateToEnglish: false,
    language,
    splitOnWord: true,
  });

  // 4) Convert + persist
  const { captions } = toCaptions({ whisperCppOutput: whisperOutput });
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const captionPath = path.join(
    outDir,
    `${basename(localAudioPath, extname(localAudioPath))}.json`,
  );
  writeFileSync(captionPath, JSON.stringify(captions, null, 2));

  // 5) Cleanup tmp
  rmSync(workDir, { recursive: true, force: true });
  
  return { captionPath, captionsJson: captions };
}

// ─── OPTIONAL CLI wrapper (keeps old behaviour) ──────────────────────────────
if (require.main === module) {
  (async () => {
    const targets = process.argv.slice(2);
    if (targets.length === 0) {
      console.error("Usage: npx tsx caption-audio.ts <file-or-url> [...]");
      process.exit(1);
    }
    for (const t of targets) {
      try {
        const { captionPath } = await captionAudio({ input: t });
        console.log("✅ Captions written:", path.relative(process.cwd(), captionPath));
      } catch (err) {
        console.error("❌", err);
      }
    }
  })();
}