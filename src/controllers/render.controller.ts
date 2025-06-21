import { Request, Response } from "express";
import {
  createRenderJob,
  getRenderJob,
  cancelRenderJob,
} from "../services/render.service";
import type { JobState } from "../jobs/render-queue"; // <- the discriminated-union you defined

/**
 * Remove the non-serialisable `cancel` method before we send a job to the client.
 */
function toPublicJob(job: JobState) {
  // Only the “queued” and “in-progress” variants contain a `cancel` function.
  // JSON.stringify will silently drop functions, but we make it explicit.
  const { cancel: _omit, ...safe } = job as any;
  return safe;
}

/* ------------------------------------------------------------------ */
/*  POST /renders – enqueue a new render                               */
/* ------------------------------------------------------------------ */
export function enqueueRender(req: Request, res: Response) {
  const { titleText } = req.body ?? {};

  if (typeof titleText !== "string") {
    return res.status(400).json({ message: "`titleText` must be a string" });
  }

  const jobId = createRenderJob({ titleText });
  return res.status(202).json({ jobId });
}

/* ------------------------------------------------------------------ */
/*  GET /renders/:id – fetch the job state                             */
/* ------------------------------------------------------------------ */
export function fetchJob(req: Request, res: Response) {
  const job = getRenderJob(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  return res.json(toPublicJob(job));
}

/* ------------------------------------------------------------------ */
/*  DELETE /renders/:id – cancel a queued / running job                */
/* ------------------------------------------------------------------ */
export function killJob(req: Request, res: Response) {
  const cancelled = cancelRenderJob(req.params.id);
  if (!cancelled) {
    return res
      .status(404)
      .json({ message: "Job not found or not cancellable" });
  }

  return res.json({ message: "Job cancelled" });
}