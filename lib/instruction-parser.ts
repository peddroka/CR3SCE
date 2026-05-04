import type { VideoOperation } from "@/lib/video-editor";

/**
 * Heuristic / regex parser for free-form Portuguese editing instructions.
 * Used as a fallback when the Groq LLM is unavailable, AND inside tests.
 *
 * Pure function: no I/O, deterministic. Easy to unit-test.
 */
export function parseInstruction(
  instruction: string,
  hasMusic: boolean,
  brandName = "CR3SCE",
): { operations: VideoOperation[]; warnings: string[] } {
  const text = instruction.toLowerCase();
  const operations: VideoOperation[] = [];
  const warnings: string[] = [];

  if (
    text.includes("legenda") ||
    text.includes("subtitle") ||
    text.includes("caption")
  ) {
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
    // "melhores momentos" should NOT trigger enhance
    if (!text.includes("melhores momentos") && !text.includes("melhor momento")) {
      operations.push({ type: "enhance", label: "Melhorar imagem" });
    }
  }

  if (
    text.includes("vinheta") ||
    text.includes("intro") ||
    text.includes("abertura")
  ) {
    operations.push({
      type: "intro",
      label: "Vinheta de entrada animada",
      brandName,
      tagline: "Conteúdo que cresce",
    });
  }
  if (
    text.includes("outro") ||
    text.includes("encerramento") ||
    text.includes("final")
  ) {
    operations.push({
      type: "outro",
      label: "Vinheta de saída animada",
      brandName,
      tagline: `Siga @${brandName.toLowerCase()}`,
    });
  }

  if (
    text.includes("vertical") ||
    text.includes("reels") ||
    text.includes("9:16") ||
    text.includes("tiktok")
  ) {
    operations.push({ type: "aspect_vertical", label: "Estilo Reels (9:16)" });
  }
  if (
    text.includes("quadrad") ||
    text.includes("1:1") ||
    text.includes("feed")
  ) {
    operations.push({
      type: "aspect_square",
      label: "Formato quadrado (1:1)",
    });
  }

  const speedMatch = text.match(/(?:acelera|rapid|velocidade)\D*(\d(?:[.,]\d+)?)/);
  if (speedMatch) {
    const factor = Number(speedMatch[1].replace(",", "."));
    if (factor > 1 && factor <= 3) {
      operations.push({
        type: "speed",
        label: `Acelerar ${factor}x`,
        speedFactor: factor,
      });
    }
  } else if (
    text.includes("acelera") ||
    text.includes("mais rapid") ||
    text.includes("mais ráp")
  ) {
    operations.push({ type: "speed", label: "Acelerar 1.5x", speedFactor: 1.5 });
  }

  if (
    text.includes("mute") ||
    text.includes("sem som") ||
    text.includes("silenc") ||
    text.includes("remove o audio") ||
    text.includes("remover audio")
  ) {
    operations.push({ type: "mute", label: "Remover áudio original" });
  }

  if (
    text.includes("fade") ||
    text.includes("transição suave") ||
    text.includes("transicao suave")
  ) {
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

  if (hasMusic) {
    const wantsMute = operations.some((op) => op.type === "mute");
    operations.push({
      type: "music",
      label: "Adicionar trilha sonora",
      musicVolume: text.includes("alta") ? 0.6 : 0.3,
      originalVolume: wantsMute ? 0 : 0.85,
    });
  }

  return { operations, warnings };
}

/**
 * Merges presets coming from the UI with operations inferred by the AI/parser.
 * Presets always win: if a type already exists in presets, IA suggestions for
 * the same type are dropped. `intro_outro` is split into intro+outro.
 */
export function mergeOperations(
  presets: VideoOperation[],
  inferred: VideoOperation[],
): VideoOperation[] {
  const merged = [...presets];
  const presetTypes = new Set(presets.map((op) => op.type));

  for (const op of inferred) {
    if (presetTypes.has(op.type)) continue;

    if (op.type === "intro_outro") {
      if (!presetTypes.has("intro")) {
        merged.push({ ...op, type: "intro", label: "Vinheta de entrada (IA)" });
      }
      if (!presetTypes.has("outro")) {
        merged.push({ ...op, type: "outro", label: "Vinheta de saída (IA)" });
      }
      continue;
    }
    merged.push(op);
  }

  return merged;
}
