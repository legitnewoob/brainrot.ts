import { Request, Response, NextFunction } from "express";
import * as audioService from "../services/audio.service";

/**
 * POST /audios
 * Generates an MP3 from the provided text using ElevenLabs.
 */
export async function createAudio(
  req: Request<{}, {}, { text?: string; speakerName?: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { text, speakerName } = req.body;
    console.log("PARAMS" , text , speakerName);
    if (typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ message: "`text` (string) is required in the request body." });
    }

    if (speakerName && typeof speakerName !== "string") {
      return res
        .status(400)
        .json({ message: "`speakerName` must be a string if provided." });
    }

    // Delegate heavy lifting to the service layer
    const { id, url } = await audioService.synthesize(text.trim(), req , {speakerName});

    res.status(201).json({ id, url });
  } catch (err) {
    next(err); // forward to global error handler
  }
}
