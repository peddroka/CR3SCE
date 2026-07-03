import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";
import {
  cleanupExpiredVideoJobs,
  getVideoEditorQuota,
  saveVideoJob,
  type VideoOperation,
} from "@/lib/video-editor";
import { parseInstruction, mergeOperations } from "@/lib/instruction-parser";

export const runtime = "nodejs";
export const maxDuration = 300;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const ACCEPTED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
]);

function fallbackInterpretInstruction(
  instruction: string,
  hasMusic: boolean,
  brandName: string,
) {
  // Delega para o parser puro e testado em lib/instruction-parser
  // (inclui o pacote de edição estilo trend).
  const { operations, warnings } = parseInstruction(
    instruction,
    hasMusic,
    brandName,
  );

  return {
    summary: operations.length
      ? operations.map((op) => op.label).join(" + ")
      : "Preview do vídeo sem edições automatizadas",
    operations,
    warnings,
    usedFallback: true,
  };
}

async function interpretInstruction(
  instruction: string,
  hasMusic: boolean,
  brandName: string,
) {
  if (!instruction.trim()) {
    return { summary: "", operations: [] as VideoOperation[], warnings: [] as string[], usedFallback: false };
  }

  if (!process.env.GROQ_API_KEY) {
    return fallbackInterpretInstruction(instruction, hasMusic, brandName);
  }

  try {
    const prompt = `Você é o intérprete de pedidos de edição de vídeo do CR3SCE.
Analise o pedido e retorne APENAS JSON válido, sem markdown, com as operações que devem ser aplicadas.

Tipos de operações disponíveis:
- "transcribe" e "burn_subtitles": para legendas automáticas (use os dois juntos)
- "trim": cortar trecho. Exige startSecond e endSecond (em segundos)
- "intro": vinheta animada de entrada. Aceita brandName, tagline (string curta para CTA)
- "outro": vinheta animada de saída. Aceita brandName, tagline
- "enhance": melhorar contraste, brilho, nitidez
- "aspect_vertical": converter para 9:16 (Reels/TikTok)
- "aspect_square": converter para 1:1 (feed Instagram)
- "speed": acelerar. Exige speedFactor (1.25, 1.5, 2)
- "music": misturar trilha sonora (só se ${hasMusic ? "TRUE" : "FALSE"} — usuário enviou música). Aceita musicVolume (0..1, padrão 0.3) e originalVolume (0..1, padrão 0.85)
- "mute": silenciar áudio original
- "fade": fade in/out nas pontas
- "highlights": detectar automaticamente os melhores momentos (cortes inteligentes baseados em fala/áudio). Use quando o usuário pedir "melhores momentos", "highlight", "destaques", "partes boas", "compilado" ou similar. Aceita onlyIfLong (boolean: só corta se o vídeo for longo)
- "trend_style": edição moderna estilo trend de Reels/TikTok (cor vibrante, legendas grandes em negrito, áudio nivelado). Use quando o usuário pedir "trend", "viral", "edição moderna", "estilo tiktok/reels"

Formato de resposta:
{
  "summary": "resumo curto em português",
  "operations": [
    { "type": "...", "label": "descrição em português", ...campos extras }
  ],
  "warnings": []
}

Regras:
- Se o usuário pedir legendas, use transcribe + burn_subtitles
- Se pedir intro/abertura/vinheta, use intro com brandName="${brandName}"
- Se pedir outro/final/encerramento, use outro com brandName="${brandName}"
- Se ${hasMusic ? "o usuário ENVIOU música" : "música NÃO foi enviada"}, ${hasMusic ? "adicione type:music" : "NÃO adicione type:music"}
- Se mencionar Reels, TikTok, vertical → aspect_vertical
- Se pedir "trend", "viral" ou "edição moderna" → monte o pacote: trend_style + aspect_vertical + transcribe + burn_subtitles + highlights com onlyIfLong=true (sem duplicar o que o pedido já cobre)
- Nunca use markdown na resposta. Apenas JSON puro.

Pedido: ${instruction}`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.2,
    });

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
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
          ? operations.map((op) => op.label).join(" + ")
          : "Preview do vídeo sem edições"),
      operations,
      warnings,
      usedFallback: false,
    };
  } catch {
    return fallbackInterpretInstruction(instruction, hasMusic, brandName);
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
        error: "Você já editou 5 vídeos hoje! Seus créditos renovam à meia-noite. 🎬",
        quota,
      },
      { status: 429 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("video");
  const music = formData.get("music");
  const introLogo = formData.get("introLogo");
  const outroLogo = formData.get("outroLogo");
  const instruction = String(formData.get("instruction") || "").trim();
  const presetsRaw = String(formData.get("presets") || "").trim();
  const brandName = String(formData.get("brandName") || "CR3SCE").trim() || "CR3SCE";

  if (!(file instanceof File)) {
    return Response.json({ error: "Envie um vídeo para continuar." }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Formato inválido. Use .mp4, .mov, .avi ou .webm." },
      { status: 400 },
    );
  }

  const musicFile = music instanceof File && music.size > 0 ? music : null;
  const introLogoFile =
    introLogo instanceof File && introLogo.size > 0 ? introLogo : null;
  const outroLogoFile =
    outroLogo instanceof File && outroLogo.size > 0 ? outroLogo : null;
  const hasMusic = !!musicFile;

  // Parse structured presets if provided (from preset cards in UI)
  let presetOperations: VideoOperation[] = [];
  if (presetsRaw) {
    try {
      const parsed = JSON.parse(presetsRaw);
      if (Array.isArray(parsed)) {
        presetOperations = parsed.map((op: VideoOperation) => {
          if (op.type === "intro" || op.type === "outro" || op.type === "intro_outro") {
            return { ...op, brandName: op.brandName || brandName };
          }
          return op;
        });
      }
    } catch {}
  }

  if (presetOperations.length === 0 && !instruction) {
    return Response.json(
      { error: "Selecione pelo menos uma predefinição ou descreva como você quer o vídeo." },
      { status: 400 },
    );
  }

  // Interpret free-form instruction with AI
  const aiResult = await interpretInstruction(instruction, hasMusic, brandName);

  // Merge: presets always apply, AI adds extra ops not covered
  const operations = mergeOperations(presetOperations, aiResult.operations);

  // If music was uploaded but no music op present yet, add a default
  const hasMusicOp = operations.some((op) => op.type === "music");
  if (hasMusic && !hasMusicOp) {
    operations.push({
      type: "music",
      label: "Adicionar trilha sonora",
      musicVolume: 0.3,
      originalVolume: 0.85,
    });
  }

  const summary =
    operations.length > 0
      ? operations.map((op) => op.label).join(" + ")
      : aiResult.summary || "Preview sem edições";

  const job = await saveVideoJob(
    user.id,
    file,
    instruction,
    summary,
    operations,
    aiResult.warnings,
    musicFile,
    introLogoFile,
    outroLogoFile,
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
