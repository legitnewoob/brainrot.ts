import {
  makeCancelSignal,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { randomUUID } from "node:crypto";
import path from "node:path";

export interface JobData {
  titleText: string;
}

export type RenderJob =
  | {
      status: "queued";
      data: JobData;
      cancel: () => void;
    }
  | {
      status: "in-progress";
      progress: number;
      data: JobData;
      cancel: () => void;
    }
  | {
      status: "completed";
      videoUrl: string;
      data: JobData;
    }
  | {
      status: "failed";
      error: Error;
      data: JobData;
    };

/** ──────────────────────────────────────────────────────────
 *  INTERNAL makeRenderQueue (your original code, unchanged)
 *  ────────────────────────────────────────────────────────── */
export function makeRenderQueue({
  port,
  serveUrl,
  rendersDir,
}: {
  port: number;
  serveUrl: string;
  rendersDir: string;
}) {
  const jobs = new Map<string, RenderJob>();
  let queue: Promise<unknown> = Promise.resolve();

  const compositionId = "CaptionedVideo";

  const processRender = async (jobId: string) => {
    const job = jobs.get(jobId);
    if (!job) throw new Error(`Render job ${jobId} not found`);

    const { cancel, cancelSignal } = makeCancelSignal();

    jobs.set(jobId, { status: "in-progress", progress: 0, data: job.data, cancel });

    try {
      const inputProps = { titleText: job.data.titleText };

      const composition = await selectComposition({
        serveUrl,
        id: compositionId,
        inputProps,
      });

      await renderMedia({
        cancelSignal,
        serveUrl,
        composition,
        inputProps,
        codec: "h264",
        onProgress: (p) => {
          console.info(`${jobId} render progress:`, p.progress);
          jobs.set(jobId, { 
            status: "in-progress", 
            progress: p.progress, 
            data: job.data, 
            cancel 
          });
        },
        outputLocation: path.join(rendersDir, `${jobId}.mp4`),
      });

      jobs.set(jobId, {
        status: "completed",
        videoUrl: `http://localhost:${port}/renders/${jobId}.mp4`,
        data: job.data,
      });
    } catch (err) {
      jobs.set(jobId, { status: "failed", error: err as Error, data: job.data });
    }
  };

  const queueRender = async (jobId: string, data: JobData) => {
    jobs.set(jobId, { status: "queued", data, cancel: () => jobs.delete(jobId) });
    queue = queue.then(() => processRender(jobId));
  };

  function createJob(data: JobData) {
    const jobId = randomUUID();
    void queueRender(jobId, data);
    return jobId;
  }

  return { createJob, jobs };
}

/** ──────────────────────────────────────────────────────────
 *  Singleton wrapper so everybody imports the *same* queue
 *  ────────────────────────────────────────────────────────── */

/**
 * Call this **once** during app bootstrap (in `server.ts`)
 */


// let queueInstance: ReturnType<typeof makeRenderQueue> | null = null;

// /** Initialise once during bootstrap (e.g. in server.ts) */
// export function initRenderQueue(cfg: {
//   port: number;
//   serveUrl: string;
//   rendersDir: string;
// }) {
//   if (!queueInstance) {
//     queueInstance = makeRenderQueue(cfg);
//   }
//   return queueInstance;
// }

// /** Always call this to use the queue elsewhere */
// export function getRenderQueue() {
//   if (!queueInstance) {
//     throw new Error(
//       "Render queue has not been initialised. Call initRenderQueue() first."
//     );
//   }
//   return queueInstance;
// }