import { Request, Response } from "express";
import * as renderService from "../services/render.service";

/**
 * POST /renders
 * Creates a new video render job
 */
export function createRenderJob(req: Request, res: Response) {
  const titleText = req.body?.titleText ?? "Hello, world!";

  if (typeof titleText !== "string") {
    return res.status(400).json({ message: "`titleText` must be a string." });
  }

  const jobId = renderService.createJob({ titleText });
  return res.status(201).json({ jobId });
}

/**
 * GET /renders/:jobId
 * Returns job details
 */
export function getRenderJob(req: Request, res: Response) {
  const job = renderService.getJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  res.json(job);
}

/**
 * DELETE /renders/:jobId
 * Cancels an in-progress or queued job
 */
export function cancelRenderJob(req: Request, res: Response) {
  const result = renderService.cancelJob(req.params.jobId);

  if (result === "not_found") {
    return res.status(404).json({ message: "Job not found" });
  }

  if (result === "not_cancellable") {
    return res.status(400).json({ message: "Job is not cancellable" });
  }

  return res.json({ message: "Job cancelled" });
}