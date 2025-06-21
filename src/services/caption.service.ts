// // src/services/caption/index.ts
// import { captionAudio } from "../../services/caption/caption-audio";
// import path from "node:path";

// export async function handleCaptionJob(job: { audioUrl: string }) {
//   const { captionPath } = await captionAudio({
//     input: job.audioUrl,
//     outDir: path.join(process.cwd(), "public", "captions"),
//   });
//   console.log("captionPath" , captionPath);
//   // e.g. save captionPath in DB or return to caller
//   return captionPath;
// }

// src/services/caption.service.ts
import { captionAudio } from "../../services/caption/caption-audio";
import path from "node:path";

export async function handleCaptionJob({ audioUrl }: { audioUrl: string }) {
  const result = await captionAudio({ input: audioUrl , outDir : path.join(process.cwd() , "public" , "captions")});

  console.log("🧪 handleCaptionJob result:", result); // 👈 Add this
  return { captionPath: result.captionPath };
}