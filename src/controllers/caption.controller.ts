// src/controllers/caption.controller.ts
import { Request, Response } from "express";
import path from "node:path";
import { handleCaptionJob } from "../services/caption.service";

/**
 * POST /api/captions
 * {
 *   "input": "<path_or_url>"
 * }
 */
export async function generateCaptions(req: Request, res: Response) {
  const audioUrl: string = req.body?.input;

  if (!audioUrl || typeof audioUrl !== "string") {
    return res.status(400).json({ message: "Missing or invalid 'input' field" });
  }

  try {
    const { captionPath } = await handleCaptionJob({ audioUrl });

    return res.status(201).json({
      message: "Captions generated successfully",
      file: path.relative(process.cwd(), captionPath),
    });
  } catch (error) {
    console.error("❌ Error generating captions:", error);
    return res.status(500).json({ message: "Failed to generate captions" });
  }
}