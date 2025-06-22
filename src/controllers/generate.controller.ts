import { Request, Response } from "express";
import * as generateService from "../services/generate.service";

/**
 * POST /api/v1/generate/final-product
 * Body: { "title": string, "speaker": string }
 */
export async function finalProduct(req: Request, res: Response) {
  // console.info("HELLOOO");
  //     return res.status(201).json({
  //     message: "Pipeline queued successfully",
  //   });
  const { title, speaker } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "`title` must be a non-empty string" });
  }
  if (typeof speaker !== "string" || !speaker.trim()) {
    return res.status(400).json({ message: "`speaker` must be a non-empty string" });
  }
  console.log(title , speaker);
  try {
    const result = await generateService.generateFinalProduct({
      title: title.trim(),
      speaker: speaker.trim(),
      req,
    });

    return res.status(201).json({
      message: "Pipeline queued successfully",
      ...result,
    });
  } catch (err) {
    console.error("❌ generate.finalProduct:", err);
    return res.status(500).json({ message: "Failed to generate final product" });
  }
}