import path from "node:path";
import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";

interface RenderBrandClipOptions {
  type: "intro" | "outro";
  brandName: string;
  tagline?: string;
  outputPath: string;
  /** Optional absolute path to a custom logo image to replace the default. */
  logoPath?: string | null;
  /** Match the user video dimensions for clean concatenation. */
  width?: number;
  height?: number;
  fps?: number;
}

function runCommand(command: string, args: string[], cwd: string) {
  return new Promise<{ code: number | null; stderr: string; stdout: string }>(
    (resolve) => {
      // On Windows, npx is a .cmd shim that requires shell:true. But we avoid passing
      // JSON args directly to shell (they get mangled). Instead we use a props file.
      const child = spawn(command, args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        shell: process.platform === "win32",
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

/**
 * Renders a Remotion-generated branded intro or outro clip to disk as an MP4
 * by invoking the Remotion CLI as a child process. Uses a temporary props file
 * to avoid shell escaping issues on Windows.
 */
export async function renderBrandClip({
  type,
  brandName,
  tagline,
  outputPath,
  logoPath,
  width = 1920,
  height = 1080,
  fps = 30,
}: RenderBrandClipOptions): Promise<void> {
  const projectRoot = process.cwd();
  const compositionId = type === "intro" ? "BrandIntro" : "BrandOutro";

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Build logoSrc as a file:// URL (Chromium can load it server-side)
  let logoSrc: string | undefined;
  if (logoPath) {
    try {
      await fs.access(logoPath);
      // Convert Windows path to file:// URL
      const normalized = path.resolve(logoPath).replace(/\\/g, "/");
      logoSrc = `file:///${normalized}`;
    } catch {
      logoSrc = undefined;
    }
  }

  // Write props to a temp JSON file (avoids shell escaping problems with --props=...)
  const propsPath = path.join(
    path.dirname(outputPath),
    `${compositionId}-props.json`,
  );
  await fs.writeFile(
    propsPath,
    JSON.stringify({
      brandName,
      tagline: tagline || "",
      ...(logoSrc ? { logoSrc } : {}),
    }),
    "utf8",
  );

  // Note: with `shell: true` on Windows, do NOT wrap args in extra quotes —
  // cmd.exe does its own quoting and double-wrapping breaks parsing.
  const args = [
    "remotion",
    "render",
    compositionId,
    outputPath,
    `--props=${propsPath}`,
    `--width=${width}`,
    `--height=${height}`,
    "--scale=1",
    "--codec=h264",
    "--log=warn",
    "--gl=swangle",
  ];

  const result = await runCommand("npx", args, projectRoot);

  // Clean up props file
  await fs.unlink(propsPath).catch(() => undefined);

  if (result.code !== 0) {
    throw new Error(
      `Remotion render failed (${type}): ${(result.stderr || result.stdout).slice(0, 400) || "unknown error"}`,
    );
  }

  // Verify the file exists
  try {
    await fs.access(outputPath);
  } catch {
    throw new Error(`Remotion render did not produce output: ${outputPath}`);
  }
}
