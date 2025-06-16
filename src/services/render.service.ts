// src/services/render.service.ts
import type { ReturnType } from "../jobs/render-queue";
import type { RenderJob } from "../jobs/render-queue";

let queue: ReturnType<typeof import("../jobs/render-queue").makeRenderQueue> | undefined;

export function setRenderQueue(q: typeof queue) {
  queue = q;
}

export function createJob(data: { titleText: string }): string {
  if (!queue) throw new Error("Render queue not initialised");
  return queue.createJob(data);
}

export function getJob(id: string): RenderJob | undefined {
  return queue?.jobs.get(id);
}

export function cancelJob(id: string) {
    const job = queue.jobs.get(id);
  if (!job) return "not_found";

  if (job.status === "queued" || job.status === "in-progress") {
    job.cancel();
    return "cancelled";
  }

  return "not_cancellable";
}
