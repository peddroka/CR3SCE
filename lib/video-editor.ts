import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

const VIDEO_EDITOR_ROOT = path.join(process.cwd(), "tmp", "video-editor");

// Caminhos absolutos para ferramentas externas (fallback para PATH)
const FFMPEG_PATH =
  process.env.FFMPEG_PATH ||
  "C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe";
const FFPROBE_PATH =
  process.env.FFPROBE_PATH ||
  "C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffprobe.exe";
const WHISPER_PATH =
  process.env.WHISPER_PATH ||
  "C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python311\\Scripts\\whisper.exe";
const INDEX_PATH = path.join(VIDEO_EDITOR_ROOT, "index.json");
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export type VideoOperationType =
  | "transcribe"
  | "burn_subtitles"
  | "trim"
  | "intro"
  | "outro"
  | "intro_outro"
  | "enhance"
  | "aspect_vertical"
  | "aspect_square"
  | "speed"
  | "music"
  | "mute"
  | "fade"
  | "highlights";

export interface VideoOperation {
  type: VideoOperationType;
  label: string;
  startSecond?: number;
  endSecond?: number;
  speedFactor?: number;
  brandName?: string;
  tagline?: string;
  /** Music track volume 0..1 (only for "music" op) */
  musicVolume?: number;
  /** Original audio volume 0..1 (only for "music" op) */
  originalVolume?: number;
}

export interface VideoJobRecord {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  originalFilename: string;
  instruction: string;
  summary: string;
  operations: VideoOperation[];
  warnings: string[];
  outputPath: string;
  outputMimeType: string;
  downloadName: string;
}

interface VideoEditorIndex {
  jobs: VideoJobRecord[];
}

function getDayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function ensureStorage() {
  await fs.mkdir(VIDEO_EDITOR_ROOT, { recursive: true });

  try {
    await fs.access(INDEX_PATH);
  } catch {
    await fs.writeFile(INDEX_PATH, JSON.stringify({ jobs: [] }, null, 2), "utf8");
  }
}

async function readIndex(): Promise<VideoEditorIndex> {
  await ensureStorage();

  try {
    const raw = await fs.readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as VideoEditorIndex;

    return {
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
    };
  } catch {
    return { jobs: [] };
  }
}

async function writeIndex(index: VideoEditorIndex) {
  await ensureStorage();
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), "utf8");
}

export async function cleanupExpiredVideoJobs() {
  const index = await readIndex();
  const now = Date.now();
  const activeJobs: VideoJobRecord[] = [];

  for (const job of index.jobs) {
    if (new Date(job.expiresAt).getTime() > now) {
      activeJobs.push(job);
      continue;
    }

    const jobDir = path.dirname(job.outputPath);
    await fs.rm(jobDir, { recursive: true, force: true }).catch(() => undefined);
  }

  if (activeJobs.length !== index.jobs.length) {
    await writeIndex({ jobs: activeJobs });
  }
}

export async function getVideoEditorQuota(userId: string) {
  await cleanupExpiredVideoJobs();
  const index = await readIndex();
  const today = getDayKey();

  const used = index.jobs.filter((job) => {
    return job.userId === userId && getDayKey(new Date(job.createdAt)) === today;
  }).length;

  return {
    used,
    limit: 5,
    remaining: Math.max(0, 5 - used),
    reached: used >= 5,
  };
}

export async function saveVideoJob(
  userId: string,
  file: File,
  instruction: string,
  summary: string,
  operations: VideoOperation[],
  warnings: string[],
  musicFile?: File | null,
  introLogoFile?: File | null,
  outroLogoFile?: File | null,
) {
  const id = randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const ext = path.extname(file.name || "").toLowerCase() || ".mp4";
  const safeBaseName = (path.basename(file.name || "video", ext) || "video")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 40);
  const jobDir = path.join(VIDEO_EDITOR_ROOT, userId, id);

  await fs.mkdir(jobDir, { recursive: true });

  const inputPath = path.join(jobDir, `source${ext}`);
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(inputPath, inputBuffer);

  // Save music track if provided
  let musicPath: string | null = null;
  if (musicFile && musicFile.size > 0) {
    const musicExt = path.extname(musicFile.name || "").toLowerCase() || ".mp3";
    musicPath = path.join(jobDir, `music${musicExt}`);
    const musicBuffer = Buffer.from(await musicFile.arrayBuffer());
    await fs.writeFile(musicPath, musicBuffer);
  }

  // Save custom intro/outro logos if provided
  let introLogoPath: string | null = null;
  if (introLogoFile && introLogoFile.size > 0) {
    const ext2 = path.extname(introLogoFile.name || "").toLowerCase() || ".png";
    introLogoPath = path.join(jobDir, `intro-logo${ext2}`);
    const buf = Buffer.from(await introLogoFile.arrayBuffer());
    await fs.writeFile(introLogoPath, buf);
  }
  let outroLogoPath: string | null = null;
  if (outroLogoFile && outroLogoFile.size > 0) {
    const ext3 = path.extname(outroLogoFile.name || "").toLowerCase() || ".png";
    outroLogoPath = path.join(jobDir, `outro-logo${ext3}`);
    const buf = Buffer.from(await outroLogoFile.arrayBuffer());
    await fs.writeFile(outroLogoPath, buf);
  }

  const processed = await processVideo({
    inputPath,
    outputDir: jobDir,
    originalMimeType: file.type || "video/mp4",
    operations,
    warnings,
    musicPath,
    introLogoPath,
    outroLogoPath,
  });

  const record: VideoJobRecord = {
    id,
    userId,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    originalFilename: file.name,
    instruction,
    summary,
    operations,
    warnings: processed.warnings,
    outputPath: processed.outputPath,
    outputMimeType: processed.outputMimeType,
    downloadName: `${safeBaseName}-editado${processed.outputExtension}`,
  };

  const index = await readIndex();
  index.jobs.push(record);
  await writeIndex(index);

  return record;
}

export async function getVideoJobById(id: string, userId: string) {
  await cleanupExpiredVideoJobs();
  const index = await readIndex();
  return index.jobs.find((job) => job.id === id && job.userId === userId) ?? null;
}

async function runCommand(command: string, args: string[]) {
  return await new Promise<{ code: number | null; stderr: string; stdout: string }>(
    (resolve) => {
      const child = spawn(command, args, {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });

      let stderr = "";
      let stdout = "";
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", () => resolve({ code: null, stderr, stdout }));
      child.on("close", (code) => resolve({ code, stderr, stdout }));
    },
  );
}

async function commandExists(command: string, args: string[] = ["-version"]) {
  const result = await runCommand(command, args);
  return result.code === 0;
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyOutput(
  inputPath: string,
  outputDir: string,
  mimeType: string,
  outputExtension: string,
) {
  const outputPath = path.join(outputDir, `processed${outputExtension}`);
  await fs.copyFile(inputPath, outputPath);

  return {
    outputPath,
    outputMimeType: mimeType,
    outputExtension,
  };
}

interface VideoMeta {
  width: number;
  height: number;
  fps: number;
  duration: number;
  hasAudio: boolean;
}

async function probeVideo(inputPath: string): Promise<VideoMeta | null> {
  const result = await runCommand(FFPROBE_PATH, [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,width,height,r_frame_rate,duration",
    "-of",
    "json",
    inputPath,
  ]);

  if (result.code !== 0) return null;

  try {
    const json = JSON.parse(result.stdout);
    const streams = (json.streams || []) as Array<{
      codec_type?: string;
      width?: number;
      height?: number;
      r_frame_rate?: string;
      duration?: string;
    }>;

    const videoStream = streams.find((s) => s.codec_type === "video");
    const hasAudio = streams.some((s) => s.codec_type === "audio");

    if (!videoStream) return null;

    const [num, den] = String(videoStream.r_frame_rate || "30/1").split("/").map(Number);
    const fps = den ? num / den : 30;

    return {
      width: Number(videoStream.width) || 1920,
      height: Number(videoStream.height) || 1080,
      fps: Math.round(fps),
      duration: Number(videoStream.duration) || 0,
      hasAudio,
    };
  } catch {
    return null;
  }
}

async function processVideo({
  inputPath,
  outputDir,
  originalMimeType,
  operations,
  warnings,
  musicPath,
  introLogoPath,
  outroLogoPath,
}: {
  inputPath: string;
  outputDir: string;
  originalMimeType: string;
  operations: VideoOperation[];
  warnings: string[];
  musicPath?: string | null;
  introLogoPath?: string | null;
  outroLogoPath?: string | null;
}) {
  const ffmpegAvailable = await commandExists(FFMPEG_PATH);
  // Whisper's --help on Windows fails due to Unicode encoding issues, so check file existence instead
  const whisperAvailable = await fileExists(WHISPER_PATH);
  const mutableWarnings = [...warnings];

  if (!ffmpegAvailable) {
    mutableWarnings.push(
      "FFmpeg não encontrado no servidor. O vídeo foi mantido no formato original.",
    );
    const fallback = await copyOutput(
      inputPath,
      outputDir,
      originalMimeType || "video/mp4",
      path.extname(inputPath) || ".mp4",
    );
    return { ...fallback, warnings: mutableWarnings };
  }

  // 1) Transcribe with Whisper if needed
  const needsSubtitles = operations.some(
    (op) => op.type === "transcribe" || op.type === "burn_subtitles",
  );
  let srtPath: string | null = null;

  if (needsSubtitles) {
    if (!whisperAvailable) {
      mutableWarnings.push(
        "Legendas automáticas ainda dependem do Whisper instalado no servidor.",
      );
    } else {
      const whisperResult = await runCommand(WHISPER_PATH, [
        inputPath,
        "--model",
        "base",
        "--language",
        "pt",
        "--output_format",
        "srt",
        "--output_dir",
        outputDir,
      ]);

      const expectedSrt = path.join(
        outputDir,
        path.basename(inputPath, path.extname(inputPath)) + ".srt",
      );

      try {
        await fs.access(expectedSrt);
        srtPath = expectedSrt;
      } catch {
        if (whisperResult.code !== 0) {
          mutableWarnings.push(
            "Whisper não conseguiu gerar legendas: " +
              (whisperResult.stderr || "erro desconhecido").slice(0, 200),
          );
        } else {
          mutableWarnings.push(
            "O arquivo de legendas não foi encontrado após transcrição.",
          );
        }
      }
    }
  }

  // 2) Probe input dimensions
  const meta = (await probeVideo(inputPath)) ?? {
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 0,
    hasAudio: false,
  };

  // 2.5) Highlights: detect interesting moments and pre-cut the input.
  // This replaces inputPath with a pre-trimmed file containing only the best segments.
  let pipelineInputPath = inputPath;
  const highlightsOp = operations.find((o) => o.type === "highlights");

  if (highlightsOp && meta.hasAudio && meta.duration > 3) {
    try {
      const { findBestMoments } = await import("./silence-detect");
      const { segments } = await findBestMoments(inputPath, meta.duration, {
        maxTotalDuration: Math.min(60, Math.max(10, meta.duration * 0.5)),
        minSegmentDuration: 0.8,
        silenceMinDuration: 0.4,
      });

      if (segments.length > 0) {
        // Build a select filter that keeps only the chosen ranges
        const between = segments
          .map((s) => `between(t,${s.start.toFixed(3)},${s.end.toFixed(3)})`)
          .join("+");

        const highlightsPath = path.join(outputDir, "highlights.mp4");
        const totalKept = segments.reduce((acc, s) => acc + s.duration, 0);

        const hlResult = await runCommand(FFMPEG_PATH, [
          "-y",
          "-i",
          inputPath,
          "-vf",
          `select='${between}',setpts=N/FRAME_RATE/TB`,
          "-af",
          `aselect='${between}',asetpts=N/SR/TB`,
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-ar",
          "44100",
          "-ac",
          "2",
          "-movflags",
          "+faststart",
          highlightsPath,
        ]);

        if (hlResult.code === 0) {
          pipelineInputPath = highlightsPath;
          mutableWarnings.push(
            `Detectados ${segments.length} momentos interessantes (total ${totalKept.toFixed(1)}s) e cortados automaticamente.`,
          );
        } else {
          mutableWarnings.push(
            "Highlights automáticos falharam: " + hlResult.stderr.slice(0, 150),
          );
        }
      } else {
        mutableWarnings.push(
          "Não foi possível detectar momentos interessantes — usando o vídeo original.",
        );
      }
    } catch (err) {
      mutableWarnings.push(
        "Falha ao analisar áudio para highlights: " +
          (err instanceof Error ? err.message : String(err)).slice(0, 150),
      );
    }
  } else if (highlightsOp && !meta.hasAudio) {
    mutableWarnings.push(
      "Highlights automáticos requerem áudio no vídeo. Pulando.",
    );
  }

  // 3) Apply main FFmpeg pipeline (trim/enhance/aspect/speed/subtitles)
  const trimOp = operations.find((o) => o.type === "trim");
  const enhanceOp = operations.find((o) => o.type === "enhance");
  const verticalOp = operations.find((o) => o.type === "aspect_vertical");
  const squareOp = operations.find((o) => o.type === "aspect_square");
  const speedOp = operations.find((o) => o.type === "speed");
  const musicOp = operations.find((o) => o.type === "music");
  const muteOp = operations.find((o) => o.type === "mute");
  const fadeOp = operations.find((o) => o.type === "fade");

  const hasMusic = !!musicOp && !!musicPath;

  const ffmpegArgs = ["-y"];

  if (
    trimOp &&
    typeof trimOp.startSecond === "number" &&
    typeof trimOp.endSecond === "number"
  ) {
    ffmpegArgs.push("-ss", String(trimOp.startSecond));
  }

  ffmpegArgs.push("-i", pipelineInputPath);

  if (
    trimOp &&
    typeof trimOp.endSecond === "number" &&
    typeof trimOp.startSecond === "number"
  ) {
    ffmpegArgs.push("-to", String(trimOp.endSecond));
  }

  // Add music as second input
  if (hasMusic) {
    ffmpegArgs.push("-stream_loop", "-1", "-i", musicPath!);
  }

  // Build video filters
  const videoFilters: string[] = [];

  if (enhanceOp) {
    videoFilters.push(
      "eq=contrast=1.08:brightness=0.03:saturation=1.08",
      "unsharp=5:5:0.8:3:3:0.4",
    );
  }

  // Aspect ratio conversions
  let outputWidth = meta.width;
  let outputHeight = meta.height;

  if (verticalOp) {
    outputWidth = 1080;
    outputHeight = 1920;
    videoFilters.push(
      "scale=1080:1920:force_original_aspect_ratio=increase",
      "crop=1080:1920",
    );
  } else if (squareOp) {
    outputWidth = 1080;
    outputHeight = 1080;
    videoFilters.push(
      "scale=1080:1080:force_original_aspect_ratio=increase",
      "crop=1080:1080",
    );
  }

  // Speed adjustment (video)
  if (speedOp && typeof speedOp.speedFactor === "number" && speedOp.speedFactor > 0) {
    const factor = speedOp.speedFactor;
    videoFilters.push(`setpts=${(1 / factor).toFixed(4)}*PTS`);
  }

  // Fade in/out at edges
  if (fadeOp) {
    const dur = trimOp?.endSecond && trimOp?.startSecond
      ? trimOp.endSecond - trimOp.startSecond
      : meta.duration || 10;
    const fadeOutStart = Math.max(0, dur - 1);
    videoFilters.push(`fade=t=in:st=0:d=0.7`);
    videoFilters.push(`fade=t=out:st=${fadeOutStart.toFixed(2)}:d=0.7`);
  }

  // Subtitles burn-in (must come last to be on top)
  if (srtPath) {
    const escapedSrtPath = srtPath.replace(/\\/g, "/").replace(/:/g, "\\:");
    videoFilters.push(
      `subtitles='${escapedSrtPath}':force_style='FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2'`,
    );
  }

  // Build audio filter chain
  const speedFactor = speedOp?.speedFactor ?? 1;
  const musicVolume = musicOp?.musicVolume ?? 0.3;
  const originalVolume = muteOp ? 0 : musicOp?.originalVolume ?? 0.85;

  if (hasMusic) {
    // Use filter_complex to mix original audio + music track.
    // If source has no audio, use only the music track (with proper duration).
    const filterComplexParts: string[] = [];
    if (videoFilters.length > 0) {
      filterComplexParts.push(`[0:v]${videoFilters.join(",")}[v]`);
    }

    if (meta.hasAudio && originalVolume > 0) {
      // Mix source audio + music
      const aFiltersOriginal: string[] = [];
      if (speedFactor !== 1) aFiltersOriginal.push(`atempo=${speedFactor}`);
      aFiltersOriginal.push(`volume=${originalVolume}`);
      filterComplexParts.push(`[0:a]${aFiltersOriginal.join(",")}[a0]`);
      filterComplexParts.push(`[1:a]volume=${musicVolume}[a1]`);
      filterComplexParts.push(
        `[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]`,
      );
    } else {
      // No source audio (or muted) — use only the music track, looped to match video
      filterComplexParts.push(`[1:a]volume=${musicVolume}[aout]`);
      if (!meta.hasAudio) {
        mutableWarnings.push(
          "O vídeo original não tem áudio. A trilha sonora será usada como áudio principal.",
        );
      }
    }

    ffmpegArgs.push("-filter_complex", filterComplexParts.join(";"));
    if (videoFilters.length > 0) {
      ffmpegArgs.push("-map", "[v]");
    } else {
      ffmpegArgs.push("-map", "0:v");
    }
    ffmpegArgs.push("-map", "[aout]");
    ffmpegArgs.push("-shortest");
  } else {
    if (videoFilters.length > 0) {
      ffmpegArgs.push("-vf", videoFilters.join(","));
    }
    // Audio chain (no music)
    const aFilters: string[] = [];
    if (speedFactor !== 1) aFilters.push(`atempo=${speedFactor}`);
    if (muteOp) {
      aFilters.push("volume=0");
    }
    if (aFilters.length > 0) {
      ffmpegArgs.push("-af", aFilters.join(","));
    }
  }

  const mainProcessedPath = path.join(outputDir, "main.mp4");
  ffmpegArgs.push(
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-r",
    String(meta.fps),
    "-c:a",
    "aac",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-movflags",
    "+faststart",
    mainProcessedPath,
  );

  const result = await runCommand(FFMPEG_PATH, ffmpegArgs);

  if (result.code !== 0) {
    mutableWarnings.push(
      "Não foi possível aplicar o processamento local com FFmpeg. O vídeo original foi preservado.",
    );

    const fallback = await copyOutput(
      inputPath,
      outputDir,
      originalMimeType || "video/mp4",
      path.extname(inputPath) || ".mp4",
    );
    return { ...fallback, warnings: mutableWarnings };
  }

  // 4) Generate Remotion intro/outro if requested
  const introOp = operations.find(
    (o) => o.type === "intro" || o.type === "intro_outro",
  );
  const outroOp = operations.find(
    (o) => o.type === "outro" || o.type === "intro_outro",
  );

  let introPath: string | null = null;
  let outroPath: string | null = null;

  // Helper: add a silent AAC audio track to a video file, re-encoded to match
  // the main pipeline's codec/format exactly. Returns the new file path.
  async function addSilentAudio(srcPath: string, outPath: string) {
    const args = [
      "-y",
      "-i",
      srcPath,
      "-f",
      "lavfi",
      "-i",
      "anullsrc=channel_layout=stereo:sample_rate=44100",
      "-shortest",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-ar",
      "44100",
      "-ac",
      "2",
      "-r",
      String(meta.fps),
      "-vf",
      `scale=${outputWidth}:${outputHeight}:force_original_aspect_ratio=decrease,pad=${outputWidth}:${outputHeight}:(ow-iw)/2:(oh-ih)/2:black,setsar=1`,
      "-movflags",
      "+faststart",
      outPath,
    ];
    return runCommand(FFMPEG_PATH, args);
  }

  if (introOp || outroOp) {
    try {
      const { renderBrandClip } = await import("./remotion-render");

      if (introOp) {
        const rawIntro = path.join(outputDir, "intro-raw.mp4");
        introPath = path.join(outputDir, "intro.mp4");
        await renderBrandClip({
          type: "intro",
          brandName: introOp.brandName || "CR3SCE",
          tagline: introOp.tagline || "Conteúdo que cresce",
          outputPath: rawIntro,
          logoPath: introLogoPath,
          width: outputWidth,
          height: outputHeight,
          fps: meta.fps,
        });
        // Re-encode with silent audio + same codec params as main video
        const r = await addSilentAudio(rawIntro, introPath);
        if (r.code !== 0) {
          mutableWarnings.push(
            "Falha ao normalizar intro: " + r.stderr.slice(0, 150),
          );
          introPath = null;
        }
      }

      if (outroOp) {
        const rawOutro = path.join(outputDir, "outro-raw.mp4");
        outroPath = path.join(outputDir, "outro.mp4");
        await renderBrandClip({
          type: "outro",
          brandName: outroOp.brandName || "CR3SCE",
          tagline: outroOp.tagline || "Siga @cr3sce",
          outputPath: rawOutro,
          logoPath: outroLogoPath,
          width: outputWidth,
          height: outputHeight,
          fps: meta.fps,
        });
        const r = await addSilentAudio(rawOutro, outroPath);
        if (r.code !== 0) {
          mutableWarnings.push(
            "Falha ao normalizar outro: " + r.stderr.slice(0, 150),
          );
          outroPath = null;
        }
      }
    } catch (err) {
      mutableWarnings.push(
        "Não foi possível gerar a vinheta animada: " +
          (err instanceof Error ? err.message : String(err)).slice(0, 200),
      );
      introPath = null;
      outroPath = null;
    }
  }

  // 5) Concatenate intro + main + outro if applicable
  let finalOutputPath = mainProcessedPath;

  if (introPath || outroPath) {
    const concatenatedPath = path.join(outputDir, "processed.mp4");
    const concatList = path.join(outputDir, "concat.txt");

    const lines: string[] = [];
    if (introPath) lines.push(`file '${introPath.replace(/'/g, "'\\''")}'`);
    lines.push(`file '${mainProcessedPath.replace(/'/g, "'\\''")}'`);
    if (outroPath) lines.push(`file '${outroPath.replace(/'/g, "'\\''")}'`);
    await fs.writeFile(concatList, lines.join("\n"), "utf8");

    // All clips were normalized to the SAME codec/resolution/fps and have AAC audio,
    // so concat demuxer can copy streams without re-encoding (fast & lossless).
    const concatResult = await runCommand(FFMPEG_PATH, [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatList,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      concatenatedPath,
    ]);

    if (concatResult.code === 0) {
      finalOutputPath = concatenatedPath;
    } else {
      mutableWarnings.push(
        "Falha ao concatenar (modo rápido). Tentando re-encode...",
      );
      // Fallback: re-encode concat
      const reencode = await runCommand(FFMPEG_PATH, [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatList,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-c:a",
        "aac",
        "-pix_fmt",
        "yuv420p",
        "-r",
        String(meta.fps),
        "-movflags",
        "+faststart",
        concatenatedPath,
      ]);
      if (reencode.code === 0) {
        finalOutputPath = concatenatedPath;
      } else {
        mutableWarnings.push(
          "Não foi possível concatenar a vinheta com o vídeo: " +
            reencode.stderr.slice(0, 200),
        );
        await fs.copyFile(mainProcessedPath, concatenatedPath);
        finalOutputPath = concatenatedPath;
      }
    }
  } else {
    const finalPath = path.join(outputDir, "processed.mp4");
    await fs.rename(mainProcessedPath, finalPath);
    finalOutputPath = finalPath;
  }

  return {
    outputPath: finalOutputPath,
    outputMimeType: "video/mp4",
    outputExtension: ".mp4",
    warnings: mutableWarnings,
  };
}
