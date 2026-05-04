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
  const text = instruction.toLowerCase();
  const operations: VideoOperation[] = [];
  const warnings: string[] = [];

  if (text.includes("legenda") || text.includes("subtitle") || text.includes("caption")) {
    operations.push(
      { type: "transcribe", label: "Transcrever áudio" },
      { type: "burn_subtitles", label: "Queimar legendas" },
    );
  }

  if (
    text.includes("melhor") ||
    text.includes("qualidade") ||
    text.includes("brilho") ||
    text.includes("contraste") ||
    text.includes("nitidez")
  ) {
    operations.push({ type: "enhance", label: "Melhorar imagem" });
  }

  if (text.includes("vinheta") || text.includes("intro") || text.includes("abertura")) {
    operations.push({
      type: "intro",
      label: "Vinheta de entrada animada",
      brandName,
      tagline: "Conteúdo que cresce",
    });
  }
  if (text.includes("outro") || text.includes("encerramento") || text.includes("final")) {
    operations.push({
      type: "outro",
      label: "Vinheta de saída animada",
      brandName,
      tagline: `Siga @${brandName.toLowerCase()}`,
    });
  }

  if (text.includes("vertical") || text.includes("reels") || text.includes("9:16") || text.includes("tiktok")) {
    operations.push({ type: "aspect_vertical", label: "Estilo Reels (9:16)" });
  }
  if (text.includes("quadrad") || text.includes("1:1") || text.includes("feed")) {
    operations.push({ type: "aspect_square", label: "Formato quadrado (1:1)" });
  }

  const speedMatch = text.match(/(?:acelera|rapid|velocidade)\D*(\d(?:[.,]\d+)?)/);
  if (speedMatch) {
    const factor = Number(speedMatch[1].replace(",", "."));
    if (factor > 1 && factor <= 3) {
      operations.push({ type: "speed", label: `Acelerar ${factor}x`, speedFactor: factor });
    }
  } else if (text.includes("acelera") || text.includes("mais rapid") || text.includes("mais ráp")) {
    operations.push({ type: "speed", label: "Acelerar 1.5x", speedFactor: 1.5 });
  }

  if (text.includes("mute") || text.includes("sem som") || text.includes("silenc") || text.includes("remove o audio") || text.includes("remover audio")) {
    operations.push({ type: "mute", label: "Remover áudio original" });
  }

  if (text.includes("fade") || text.includes("transição suave") || text.includes("transicao suave")) {
    operations.push({ type: "fade", label: "Fade in/out nas pontas" });
  }

  if (
    text.includes("melhores momentos") ||
    text.includes("melhor momento") ||
    text.includes("highlight") ||
    text.includes("destaque") ||
    text.includes("partes boas") ||
    text.includes("compilad")
  ) {
    operations.push({
      type: "highlights",
      label: "Detectar e cortar melhores momentos",
    });
  }

  const trimMatch =
    text.match(/cort\w*[^0-9]*(\d+)\s*[s]?\s*(?:até|ate|a)\s*(\d+)/i) ||
    text.match(/de\s+(\d+)\s*(?:s|seg)?\s+(?:até|ate|a)\s+(\d+)/i);

  if (trimMatch) {
    const start = Number(trimMatch[1]);
    const end = Number(trimMatch[2]);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
      operations.push({
        type: "trim",
        label: `Cortar de ${start}s até ${end}s`,
        startSecond: start,
        endSecond: end,
      });
    }
  } else {
    const endOnly = text.match(/(?:cort\w*|primeiros?)[^0-9]*(\d+)\s*(?:s|seg)/i);
    if (endOnly) {
      const end = Number(endOnly[1]);
      if (!Number.isNaN(end) && end > 0) {
        operations.push({
          type: "trim",
          label: `Cortar do início até ${end}s`,
          startSecond: 0,
          endSecond: end,
        });
      }
    }
  }

  // If user uploaded music + said anything mixable
  if (hasMusic) {
    const wantsMute = operations.some((op) => op.type === "mute");
    operations.push({
      type: "music",
      label: "Adicionar trilha sonora",
      musicVolume: text.includes("alta") ? 0.6 : 0.3,
      originalVolume: wantsMute ? 0 : 0.85,
    });
  }

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
- "highlights": detectar automaticamente os melhores momentos (cortes inteligentes baseados em fala/áudio). Use quando o usuário pedir "melhores momentos", "highlight", "destaques", "partes boas", "compilado" ou similar

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

/**
 * Merge two operation lists, preferring presets but adding IA-only ops not in presets.
 */
function mergeOperations(
  presets: VideoOperation[],
  aiOps: VideoOperation[],
): VideoOperation[] {
  const merged = [...presets];
  const presetTypes = new Set(presets.map((op) => op.type));

  for (const op of aiOps) {
    // Skip if same type already in presets (presets win)
    if (presetTypes.has(op.type)) continue;
    // Treat intro_outro as both intro+outro
    if (op.type === "intro_outro") {
      if (!presetTypes.has("intro")) merged.push({ ...op, type: "intro", label: "Vinheta de entrada (IA)" });
      if (!presetTypes.has("outro")) merged.push({ ...op, type: "outro", label: "Vinheta de saída (IA)" });
      continue;
    }
    merged.push(op);
  }

  return merged;
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
