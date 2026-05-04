import { describe, expect, it, beforeEach, afterAll, vi } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * The video-editor lib uses the project's `tmp/video-editor/` directory.
 * For tests we override `process.cwd()` to a temp directory so we don't
 * collide with real jobs.
 */

const realCwd = process.cwd();
const testRoot = path.join(os.tmpdir(), `cr3sce-tests-${Date.now()}`);

beforeEach(async () => {
  await fs.mkdir(testRoot, { recursive: true });
  vi.spyOn(process, "cwd").mockReturnValue(testRoot);
  // Reset module cache so VIDEO_EDITOR_ROOT is recomputed
  vi.resetModules();
});

afterAll(async () => {
  vi.restoreAllMocks();
  await fs.rm(testRoot, { recursive: true, force: true }).catch(() => undefined);
});

describe("getVideoEditorQuota", () => {
  it("returns full quota for a user with no jobs", async () => {
    const { getVideoEditorQuota } = await import("@/lib/video-editor");
    const quota = await getVideoEditorQuota("user-empty");

    expect(quota.used).toBe(0);
    expect(quota.limit).toBe(5);
    expect(quota.remaining).toBe(5);
    expect(quota.reached).toBe(false);
  });

  it("counts jobs created today and decrements remaining", async () => {
    // Pre-seed the index with two jobs from today
    const indexDir = path.join(testRoot, "tmp", "video-editor");
    await fs.mkdir(indexDir, { recursive: true });

    const today = new Date();
    const farFuture = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const seed = {
      jobs: [
        {
          id: "job-1",
          userId: "alice",
          createdAt: today.toISOString(),
          expiresAt: farFuture.toISOString(),
          originalFilename: "v1.mp4",
          instruction: "",
          summary: "",
          operations: [],
          warnings: [],
          outputPath: path.join(indexDir, "alice", "job-1", "processed.mp4"),
          outputMimeType: "video/mp4",
          downloadName: "v1.mp4",
        },
        {
          id: "job-2",
          userId: "alice",
          createdAt: today.toISOString(),
          expiresAt: farFuture.toISOString(),
          originalFilename: "v2.mp4",
          instruction: "",
          summary: "",
          operations: [],
          warnings: [],
          outputPath: path.join(indexDir, "alice", "job-2", "processed.mp4"),
          outputMimeType: "video/mp4",
          downloadName: "v2.mp4",
        },
        {
          id: "job-other",
          userId: "bob",
          createdAt: today.toISOString(),
          expiresAt: farFuture.toISOString(),
          originalFilename: "v.mp4",
          instruction: "",
          summary: "",
          operations: [],
          warnings: [],
          outputPath: path.join(indexDir, "bob", "job-other", "processed.mp4"),
          outputMimeType: "video/mp4",
          downloadName: "v.mp4",
        },
      ],
    };

    await fs.writeFile(
      path.join(indexDir, "index.json"),
      JSON.stringify(seed),
      "utf8",
    );

    const { getVideoEditorQuota } = await import("@/lib/video-editor");
    const aliceQuota = await getVideoEditorQuota("alice");
    expect(aliceQuota.used).toBe(2);
    expect(aliceQuota.remaining).toBe(3);
    expect(aliceQuota.reached).toBe(false);

    const bobQuota = await getVideoEditorQuota("bob");
    expect(bobQuota.used).toBe(1);
    expect(bobQuota.remaining).toBe(4);
  });

  it("flags reached=true when user hits the daily limit", async () => {
    const indexDir = path.join(testRoot, "tmp", "video-editor");
    await fs.mkdir(indexDir, { recursive: true });

    const today = new Date();
    const farFuture = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const jobs = Array.from({ length: 5 }, (_, i) => ({
      id: `job-${i}`,
      userId: "heavy-user",
      createdAt: today.toISOString(),
      expiresAt: farFuture.toISOString(),
      originalFilename: `v${i}.mp4`,
      instruction: "",
      summary: "",
      operations: [],
      warnings: [],
      outputPath: path.join(indexDir, "heavy-user", `job-${i}`, "processed.mp4"),
      outputMimeType: "video/mp4",
      downloadName: `v${i}.mp4`,
    }));

    await fs.writeFile(
      path.join(indexDir, "index.json"),
      JSON.stringify({ jobs }),
      "utf8",
    );

    const { getVideoEditorQuota } = await import("@/lib/video-editor");
    const quota = await getVideoEditorQuota("heavy-user");
    expect(quota.used).toBe(5);
    expect(quota.remaining).toBe(0);
    expect(quota.reached).toBe(true);
  });

  it("does not count jobs from previous days", async () => {
    const indexDir = path.join(testRoot, "tmp", "video-editor");
    await fs.mkdir(indexDir, { recursive: true });

    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const farFuture = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const seed = {
      jobs: [
        {
          id: "old",
          userId: "alice",
          createdAt: yesterday.toISOString(),
          expiresAt: farFuture.toISOString(),
          originalFilename: "old.mp4",
          instruction: "",
          summary: "",
          operations: [],
          warnings: [],
          outputPath: path.join(indexDir, "alice", "old", "processed.mp4"),
          outputMimeType: "video/mp4",
          downloadName: "old.mp4",
        },
      ],
    };

    await fs.writeFile(
      path.join(indexDir, "index.json"),
      JSON.stringify(seed),
      "utf8",
    );

    const { getVideoEditorQuota } = await import("@/lib/video-editor");
    const quota = await getVideoEditorQuota("alice");
    expect(quota.used).toBe(0);
  });
});

afterAll(async () => {
  process.chdir(realCwd);
});
