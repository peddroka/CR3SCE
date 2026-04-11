import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";
import {
  cleanupExpiredVideoJobs,
  getVideoEditorQuota,
  saveVideoJob,
  type VideoOperation,
} from "@/lib/video-editor";

export const runtime = "nodejs";
export const maxDuration = 60;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const ACCEPTED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
]);

function fallbackInterpretInstruction(instruction: string) {
  const text = instruction.toLowerCase();
  const operations: VideoOperation[] = [];
  const warnings: string[] = [];

  if (text.includes("legenda")) {
    operations.push(
      { type: "transcribe", label: "Transcrever audio" },
      { type: "burn_subtitles", label: "Queimar legendas no video" },
    );
  }

  if (
    text.includes("melhorar") ||
    text.includes("qualidade") ||
    text.includes("brilho") ||
    text.includes("contraste")
  ) {
    operations.push({ type: "enhance", label: "Melhorar imagem" });
  }

  if (text.includes("vinheta")) {
    operations.push({
      type: "intro_outro",
      label: "Adicionar vinheta de entrada e saida",
    });
  }

  const trimMatch =
    text.match(/corta(?:r)?(?: do inicio)?(?: ate| at[eé])\s*(\d+)\s*seg/i) ||
    text.match(/ate\s*(\d+)\s*seg/i) ||
    text.match(/segundo\s*(\d+)/i);

  if (trimMatch) {
    const endSecond = Number(trimMatch[1]);
    if (!Number.isNaN(endSecond) && endSecond > 0) {
      operations.push({
        type: "trim",
        label: `Cortar do inicio ate ${endSecond}s`,
        startSecond: 0,
        endSecond,
      });
    }
  }

  if (operations.length === 0) {
    warnings.push(
      "Nao foi possivel identificar uma operacao automatica clara. O video sera mantido como base para preview.",
    );
  }

  return {
    summary: operations.length
      ? operations.map((operation) => operation.label).join(" + ")
      : "Preview do video sem edicoes automatizadas",
    operations,
    warnings,
    usedFallback: true,
  };
}

async function interpretInstruction(instruction: string) {
  if (!process.env.GROQ_API_KEY) {
    return fallbackInterpretInstruction(instruction);
  }

  try {
    const prompt = `Voce interpreta pedidos curtos de edicao de video para o sistema CR3SCE.

Analise o pedido abaixo e responda APENAS com JSON valido:
{
  "summary": "resumo curto em portugues",
  "operations": [
    {
      "type": "transcribe|burn_subtitles|trim|intro_outro|enhance",
      "label": "descricao curta",
      "startSecond": 0,
      "endSecond": 30
    }
  ],
  "warnings": ["aviso opcional"]
}

Regras:
- Use "trim" apenas quando houver tempo claro.
- Se o usuario pedir legendas, retorne "transcribe" e "burn_subtitles".
- Se o usuario pedir qualidade, brilho, contraste ou nitidez, retorne "enhance".
- Se o pedido nao estiver claro, retorne lista vazia.
- Nunca use markdown.

Pedido: ${instruction}`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.2,
    });

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      summary?: string;
      operations?: VideoOperation[];
      warnings?: string[];
    };

    const operations = Array.isArray(parsed.operations) ? parsed.operations : [];
    const warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];

    return {
      summary:
        parsed.summary?.trim() ||
        (operations.length
          ? operations.map((operation) => operation.label).join(" + ")
          : "Preview do video sem edicoes automatizadas"),
      operations,
      warnings,
      usedFallback: false,
    };
  } catch {
    return fallbackInterpretInstruction(instruction);
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await cleanupExpiredVideoJobs();
  const quota = await getVideoEditorQuota(user.id);

  return Response.json(quota);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await cleanupExpiredVideoJobs();
  const quota = await getVideoEditorQuota(user.id);

  if (quota.reached) {
    return Response.json(
      {
        error: "Voce ja editou 5 videos hoje! Seus creditos renovam a meia-noite. 🎬",
        quota,
      },
      { status: 429 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("video");
  const instruction = String(formData.get("instruction") || "").trim();

  if (!(file instanceof File)) {
    return Response.json({ error: "Envie um video para continuar." }, { status: 400 });
  }

  if (!instruction) {
    return Response.json(
      { error: "Descreva como voce quer o video editado." },
      { status: 400 },
    );
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Formato invalido. Use .mp4, .mov, .avi ou .webm." },
      { status: 400 },
    );
  }

  const interpreted = await interpretInstruction(instruction);
  const job = await saveVideoJob(
    user.id,
    file,
    instruction,
    interpreted.summary,
    interpreted.operations,
    interpreted.warnings,
  );

  const updatedQuota = await getVideoEditorQuota(user.id);

  return Response.json({
    jobId: job.id,
    summary: job.summary,
    operations: job.operations,
    warnings: job.warnings,
    previewUrl: `/api/video-editor/${job.id}`,
    downloadUrl: `/api/video-editor/${job.id}?download=1`,
    quota: updatedQuota,
  });
}
