import { Request, Response } from "express";
import * as scriptService from "../services/script.service";

/**
 * POST /scripts
 * Creates a new TTS script + MP3 render job
 */
export async function createScript(req: Request, res: Response) {
  const titleText = req.body?.title ?? "Talk about JWT";
  const speaker   = req.body?.speaker ?? "Peter Griffin";

  if (typeof titleText !== "string" || typeof speaker !== "string") {
    return res.status(400).json({ message: "input must be a string." });
  }

  try {
    // NOTE: pass req so the service can build an absolute URL
    const { id, url } = await scriptService.createScript(titleText, speaker, req);
    console.log("Scipt id :" + id);
    return res.status(201).json({ id, url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not create script" });
  }
}
/**
 * GET /renders/:jobId
 * Returns job details
 */
// export function getScript(req: Request, res: Response) {
//   const job = renderService.getJob(req.params.jobId);

//   if (!job) {
//     return res.status(404).json({ message: "Job not found" });
//   }

//   res.json(job);
// }
