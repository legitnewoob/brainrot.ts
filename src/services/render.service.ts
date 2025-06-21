// src/services/render.service.ts
import type { JobData } from "../jobs/render-queue";

/**
 * The queue instance will be injected once, e.g. in your main/bootstrap file:
 *   setRenderQueue(makeRenderQueue({ port, serveUrl, rendersDir }));
 */
let queue: ReturnType<typeof import("../jobs/render-queue").makeRenderQueue> | undefined;

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */
export function setRenderQueue(
  q: ReturnType<typeof import("../jobs/render-queue").makeRenderQueue>,
) {
  queue = q;
}

export function createRenderJob(data: JobData): string {
  assertQueue();
  return queue!.createJob(data);
}

export function getRenderJob(id: string) {
  assertQueue();
  return queue!.jobs.get(id);
}

/**
 * Cancels a job if it is still “queued” or “in-progress”.
 * Returns true if a cancel actually happened, false otherwise.
 */
export function cancelRenderJob(id: string): boolean {
  assertQueue();

  const job = queue!.jobs.get(id);
  if (!job) {
    return false; // unknown job ID
  }

  if (job.status === "queued" || job.status === "in-progress") {
    job.cancel();

    // Mark it as failed/cancelled so callers see the final state.
    queue!.jobs.set(id, {
      ...job,
      // drop the `cancel` property so it matches the “failed” variant
      ...(job.status === "queued" || job.status === "in-progress"
        ? { cancel: undefined }
        : {}),
      status: "failed",
      error: new Error("Render cancelled by user"),
    } as any); // `as any` avoids a narrow discriminated-union clash

    return true;
  }

  // Job already finished or failed on its own – nothing to cancel.
  return false;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function assertQueue(): asserts queue {
  if (!queue) {
    throw new Error(
      "Render queue has not been initialised. Call setRenderQueue() first.",
    );
  }
}