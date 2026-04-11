import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { cleanupExpiredVideoJobs, getVideoJobById } from "@/lib/video-editor";

export const runtime = "nodejs";

function getContentDisposition(filename: string) {
  return `attachment; filename="${encodeURIComponent(filename)}"`;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await cleanupExpiredVideoJobs();
  const { jobId } = await context.params;
  const job = await getVideoJobById(jobId, user.id);

  if (!job) {
    return Response.json({ error: "Arquivo nao encontrado." }, { status: 404 });
  }

  const fileBuffer = await readFile(job.outputPath);
  const url = new URL(req.url);
  const headers = new Headers({
    "Content-Type": job.outputMimeType || "application/octet-stream",
    "Cache-Control": "private, max-age=3600",
  });

  if (url.searchParams.get("download") === "1") {
    headers.set("Content-Disposition", getContentDisposition(job.downloadName));
  } else {
    headers.set(
      "Content-Disposition",
      `inline; filename="${path.basename(job.outputPath)}"`,
    );
  }

  return new Response(fileBuffer, { headers });
}
