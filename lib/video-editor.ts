import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

const VIDEO_EDITOR_ROOT = path.join(process.cwd(), "tmp", "video-editor");
const INDEX_PATH = path.join(VIDEO_EDITOR_ROOT, "index.json");
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export type VideoOperationType =
  | "transcribe"
  | "burn_subtitles"
  | "trim"
  | "intro_outro"
  | "enhance";

export interface VideoOperation {
  type: VideoOperationType;
  label: string;
  startSecond?: number;
  endSecond?: number;
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

  const processed = await processVideo({
    inputPath,
    outputDir: jobDir,
    originalMimeType: file.type || "video/mp4",
    operations,
    warnings,
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
  return await new Promise<{ code: number | null; stderr: string }>((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", () => resolve({ code: null, stderr }));
    child.on("close", (code) => resolve({ code, stderr }));
  });
}

async function commandExists(command: string, args: string[] = ["-version"]) {
  const result = await runCommand(command, args);
  return result.code === 0;
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

async function processVideo({
  inputPath,
  outputDir,
  originalMimeType,
  operations,
  warnings,
}: {
  inputPath: string;
  outputDir: string;
  originalMimeType: string;
  operations: VideoOperation[];
  warnings: string[];
}) {
  const ffmpegAvailable = await commandExists("ffmpeg");
  const whisperAvailable = await commandExists("whisper", ["--help"]);
  const mutableWarnings = [...warnings];

  if (
    operations.some(
      (operation) =>
        operation.type === "transcribe" || operation.type === "burn_subtitles",
    )
  ) {
    if (!whisperAvailable) {
      mutableWarnings.push(
        "Legendas automaticas ainda dependem do Whisper instalado no servidor.",
      );
    } else {
      mutableWarnings.push(
        "O fluxo de legendas foi reconhecido, mas ainda esta em modo inicial neste ambiente.",
      );
    }
  }

  if (operations.some((operation) => operation.type === "intro_outro")) {
    mutableWarnings.push(
      "Vinhetas de entrada e saida exigem arquivos-base configurados no servidor.",
    );
  }

  const canUseFfmpegPipeline =
    ffmpegAvailable &&
    operations.some(
      (operation) => operation.type === "trim" || operation.type === "enhance",
    );

  if (!canUseFfmpegPipeline) {
    if (!ffmpegAvailable) {
      mutableWarnings.push(
        "FFmpeg nao encontrado no servidor. O video foi mantido no formato original.",
      );
    }

    return await copyOutput(
      inputPath,
      outputDir,
      originalMimeType || "video/mp4",
      path.extname(inputPath) || ".mp4",
    ).then((result) => ({
      ...result,
      warnings: mutableWarnings,
    }));
  }

  const trimOperation = operations.find((operation) => operation.type === "trim");
  const enhanceOperation = operations.find(
    (operation) => operation.type === "enhance",
  );

  const ffmpegArgs = ["-y"];

  if (
    trimOperation &&
    typeof trimOperation.startSecond === "number" &&
    typeof trimOperation.endSecond === "number"
  ) {
    ffmpegArgs.push("-ss", String(trimOperation.startSecond));
  }

  ffmpegArgs.push("-i", inputPath);

  if (
    trimOperation &&
    typeof trimOperation.endSecond === "number" &&
    typeof trimOperation.startSecond === "number"
  ) {
    ffmpegArgs.push("-to", String(trimOperation.endSecond));
  }

  if (enhanceOperation) {
    ffmpegArgs.push(
      "-vf",
      "eq=contrast=1.08:brightness=0.03:saturation=1.08,unsharp=5:5:0.8:3:3:0.4",
    );
  }

  const outputPath = path.join(outputDir, "processed.mp4");
  ffmpegArgs.push(
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    outputPath,
  );

  const result = await runCommand("ffmpeg", ffmpegArgs);

  if (result.code !== 0) {
    mutableWarnings.push(
      "Nao foi possivel aplicar o processamento local com FFmpeg. O video original foi preservado.",
    );

    return await copyOutput(
      inputPath,
      outputDir,
      originalMimeType || "video/mp4",
      path.extname(inputPath) || ".mp4",
    ).then((fallback) => ({
      ...fallback,
      warnings: mutableWarnings,
    }));
  }

  return {
    outputPath,
    outputMimeType: "video/mp4",
    outputExtension: ".mp4",
    warnings: mutableWarnings,
  };
}
