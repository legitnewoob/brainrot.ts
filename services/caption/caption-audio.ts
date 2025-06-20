// caption-audio.ts  ───────────────────────────────────────────────────────────
// Usage examples:
//   npx tsx caption-audio.ts ./assets/voiceover.mp3
//   npx tsx caption-audio.ts https://example.com/podcast.wav
// ---------------------------------------------------------------------------

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  mkdtempSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { dirname, basename, extname } from "node:path";
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

// ────────────────────────────── helpers ──────────────────────────────────────

/**
 * Download a remote file (HTTP/S) to the given output path.
 */


async function download(url: string, outputPath: string) {
  const client = url.startsWith("https") ? https : http;
  await pipeline(
    client.get(url, { headers: { "User-Agent": "caption-script/1.0" } }),
    createWriteStream(outputPath),
  );
}

/**
 * Convert any audio file to a temporary 16 kHz mono WAV ― the format Whisper
 * prefers. Returns the temp WAV path.
 */
function convertToWav(input: string, workDir: string): string {
  const out = path.join(workDir, `${basename(input, extname(input))}.wav`);
  execSync(
    `npx remotion ffmpeg -i "${input}" -ar 16000 -ac 1 "${out}" -y`,
    { stdio: ["ignore", "inherit"] },
  );
  return out;
}

/**
 * Ensure we have Whisper C++ and the requested model locally.
 */
async function prepareWhisper() {
    console.log(WHISPER_PATH);
  await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
  await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });
}

// ────────────────────────────── main worker ──────────────────────────────────

async function captionOne(inputArg: string) {
  const workDir = mkdtempSync(path.join(tmpdir(), "caption-"));
  let localAudioPath = inputArg;

  // 1) If the argument is a URL, download it first.
  if (/^https?:\/\//i.test(inputArg)) {
    const downloadPath = path.join(
      workDir,
      basename(new URL(inputArg).pathname) || "audio",
    );
    console.log("↯ Downloading remote audio…");
    await download(inputArg, downloadPath);
    localAudioPath = downloadPath;
  }

  if (!existsSync(localAudioPath)) {
    throw new Error(`Input file not found: ${localAudioPath}`);
  }

  // 2) Convert to 16 kHz WAV if necessary
  const wavPath =
    extname(localAudioPath).toLowerCase() === ".wav"
      ? localAudioPath
      : convertToWav(localAudioPath, workDir);

  // 3) Transcribe with Whisper C++
  console.log("🗣️  Transcribing with Whisper...");
  const whisperOutput = await transcribe({
    inputPath: wavPath,
    model: WHISPER_MODEL,
    tokenLevelTimestamps: true,
    whisperPath: WHISPER_PATH,
    whisperCppVersion: WHISPER_VERSION,
    printOutput: false,
    translateToEnglish: false,
    language: WHISPER_LANG,
    splitOnWord: true,
  });

  // 4) Convert to caption JSON
  const { captions } = toCaptions({ whisperCppOutput: whisperOutput });

  // 5) Persist under /public/captions
  const captionsDir = path.join(process.cwd(), "../public", "captions");
  if (!existsSync(captionsDir)) {
    mkdirSync(captionsDir, { recursive: true });
  }
  const outJson = path.join(
    captionsDir,
    `${basename(localAudioPath, extname(localAudioPath))}.json`,
  );
  writeFileSync(outJson, JSON.stringify(captions, null, 2));
  console.log(`✅ Captions written → ${path.relative(process.cwd(), outJson)}`);

  // 6) Clean up temp
  rmSync(workDir, { recursive: true, force: true });
}

// ────────────────────────────── bootstrap ────────────────────────────────────

(async () => {
  try {
    await prepareWhisper();

    const targets = process.argv.slice(2);
    if (targets.length === 0) {
      console.error("⚠️  Pass at least one audio file or URL");
      process.exit(1);
    }

    for (const target of targets) {
      await captionOne(target);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();