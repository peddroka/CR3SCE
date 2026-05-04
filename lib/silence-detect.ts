import { spawn } from "node:child_process";

const FFMPEG_PATH =
  process.env.FFMPEG_PATH ||
  "C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe";

function runFFmpeg(args: string[]) {
  return new Promise<{ code: number | null; stderr: string }>((resolve) => {
    const child = spawn(FFMPEG_PATH, args, {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("error", () => resolve({ code: null, stderr }));
    child.on("close", (code) => resolve({ code, stderr }));
  });
}

export interface SilenceSegment {
  start: number;
  end: number;
  duration: number;
}

export interface InterestingSegment {
  start: number;
  end: number;
  duration: number;
}

/**
 * Step 1: Measure loudness with `loudnorm` to get the gating threshold.
 * Returns the EBU R128 gating threshold (dB) used for silence detection.
 */
async function measureLoudnessThreshold(inputPath: string): Promise<number> {
  const result = await runFFmpeg([
    "-i",
    inputPath,
    "-map",
    "0:a",
    "-af",
    "loudnorm=print_format=json",
    "-f",
    "null",
    "-",
  ]);

  // The JSON is printed in stderr at the end of the run
  const match = result.stderr.match(/\{[\s\S]*?"input_thresh"[\s\S]*?\}/);
  if (match) {
    try {
      const json = JSON.parse(match[0]);
      const thresh = Number(json.input_thresh);
      if (!Number.isNaN(thresh)) return thresh;
    } catch {}
  }
  // Fallback default
  return -30;
}

/**
 * Step 2: Detect silent segments using the adaptive threshold.
 * Returns timestamps of all silent regions.
 */
async function detectSilence(
  inputPath: string,
  threshold: number,
  minDuration = 0.4,
): Promise<SilenceSegment[]> {
  const result = await runFFmpeg([
    "-i",
    inputPath,
    "-map",
    "0:a",
    "-af",
    `silencedetect=noise=${threshold}dB:d=${minDuration}`,
    "-f",
    "null",
    "-",
  ]);

  const segments: SilenceSegment[] = [];
  // Parse stderr: lines like
  // [silencedetect @ 0x...] silence_start: 1.234
  // [silencedetect @ 0x...] silence_end: 2.345 | silence_duration: 1.111
  const lines = result.stderr.split("\n");
  let pendingStart: number | null = null;
  for (const line of lines) {
    const startMatch = line.match(/silence_start:\s*([\d.]+)/);
    const endMatch = line.match(
      /silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/,
    );
    if (startMatch) {
      pendingStart = Number(startMatch[1]);
    } else if (endMatch && pendingStart !== null) {
      const end = Number(endMatch[1]);
      const duration = Number(endMatch[2]);
      segments.push({ start: pendingStart, end, duration });
      pendingStart = null;
    }
  }
  return segments;
}

/**
 * Compute the "interesting" non-silent segments by inverting the silence list.
 * Exported for unit tests.
 */
export function invertSilences(
  silences: SilenceSegment[],
  totalDuration: number,
  minSegmentDuration = 0.5,
): InterestingSegment[] {
  const segments: InterestingSegment[] = [];

  let cursor = 0;
  for (const sil of silences) {
    if (sil.start > cursor + minSegmentDuration) {
      segments.push({
        start: cursor,
        end: sil.start,
        duration: sil.start - cursor,
      });
    }
    cursor = Math.max(cursor, sil.end);
  }

  if (totalDuration - cursor > minSegmentDuration) {
    segments.push({
      start: cursor,
      end: totalDuration,
      duration: totalDuration - cursor,
    });
  }

  return segments;
}

/**
 * Pick the best moments: top N segments by duration, sorted chronologically,
 * capped at a target total duration so the result is a tight highlights reel.
 */
export async function findBestMoments(
  inputPath: string,
  totalDuration: number,
  options: {
    maxTotalDuration?: number;
    minSegmentDuration?: number;
    silenceMinDuration?: number;
  } = {},
): Promise<{
  segments: InterestingSegment[];
  threshold: number;
  silences: SilenceSegment[];
}> {
  const {
    maxTotalDuration = Math.min(60, totalDuration * 0.6),
    minSegmentDuration = 0.8,
    silenceMinDuration = 0.4,
  } = options;

  const threshold = await measureLoudnessThreshold(inputPath);
  const silences = await detectSilence(inputPath, threshold, silenceMinDuration);
  const interesting = invertSilences(silences, totalDuration, minSegmentDuration);

  // Sort by duration desc to pick the longest (most "important") segments
  const byDuration = [...interesting].sort((a, b) => b.duration - a.duration);

  const picked: InterestingSegment[] = [];
  let total = 0;
  for (const seg of byDuration) {
    if (total + seg.duration <= maxTotalDuration) {
      picked.push(seg);
      total += seg.duration;
    }
    if (total >= maxTotalDuration) break;
  }

  // Re-sort chronologically for natural playback
  picked.sort((a, b) => a.start - b.start);

  return { segments: picked, threshold, silences };
}
