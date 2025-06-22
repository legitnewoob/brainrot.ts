import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  cancelRender,
  continueRender,
  delayRender,
  getStaticFiles,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
  watchStaticFile,
} from "remotion";
import { z } from "zod";
import { getVideoMetadata } from "@remotion/media-utils";
import { loadFont } from "../load-font";
import { NoCaptionFile } from "./NoCaptionFile";
import {
  Caption,
  createTikTokStyleCaptions,
} from "@remotion/captions";
import SubtitlePage from "./SubtitlePage";

/* ------------------------------------------------------------------ */
/*  Zod schema + metadata helper                                       */
/* ------------------------------------------------------------------ */
export const captionedVideoSchema = z.object({
  videoPath: z.string(),
  audioPath: z.string(),
  captionsPath: z.string(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const fps = 30;
  const metadata = await getVideoMetadata(props.videoPath);

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
  };
};

/* ------------------------------------------------------------------ */
/*  Helper to see if captions file really exists                       */
/* ------------------------------------------------------------------ */
const fileExists = (file: string) =>
  Boolean(getStaticFiles().find((f) => f.src === file));

/* You can tweak this to show more / fewer words per subtitle chunk. */
const SWITCH_CAPTIONS_EVERY_MS = 1200;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export const CaptionedVideo: React.FC<{
  videoPath: string;
  audioPath: string;
  captionsPath: string;
}> = ({ videoPath, audioPath, captionsPath }) => {
  const { fps } = useVideoConfig();
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());

  console.log("ASSETS" , videoPath , audioPath , captionsPath);
  /* Fetch / reload captions ------------------------------------------------ */
  const fetchSubtitles = useCallback(async () => {
    try {
      await loadFont();
      const res = await fetch(captionsPath);
      const data = (await res.json()) as Caption[];
      setSubtitles(data);
      continueRender(handle);
    } catch (err) {
      cancelRender(err);
    }
  }, [captionsPath, handle]);

  useEffect(() => {
    fetchSubtitles();
    const watcher = watchStaticFile(captionsPath, fetchSubtitles);
    return () => watcher.cancel();
  }, [captionsPath, fetchSubtitles]);

  /* TikTok-style pagination ----------------------------------------------- */
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
        captions: subtitles,
      }),
    [subtitles],
  );

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {/* Base video + audio ------------------------------------------------ */}
      <AbsoluteFill>
        <OffthreadVideo src={videoPath} style={{ objectFit: "cover" }} />
        <Audio src={audioPath} />
      </AbsoluteFill>

      {/* Subtitles --------------------------------------------------------- */}
      {pages.map((page, idx) => {
        const next = pages[idx + 1] ?? null;

        const start = (page.startMs / 1000) * fps;
        const end = Math.min(
          next ? (next.startMs / 1000) * fps : Infinity,
          start + SWITCH_CAPTIONS_EVERY_MS,
        );
        const duration = end - start;
        if (duration <= 0) return null;

        return (
          <Sequence key={idx} from={start} durationInFrames={duration}>
            <SubtitlePage page={page} />
          </Sequence>
        );
      })}

      {/* {!fileExists(captionsPath) && <NoCaptionFile />} */}
    </AbsoluteFill>
  );
};