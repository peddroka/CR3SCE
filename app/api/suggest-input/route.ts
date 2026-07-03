import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || "" });

// Modelo rápido primeiro (sugestões precisam ser instantâneas), 70B como fallback.
const MODELS = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];

type SuggestField =
  | "post_topic"
  | "post_tone"
  | "post_notes"
  | "image_prompt"
  | "brand_description";

const FIELD_INSTRUCTIONS: Record<SuggestField, string> = {
  post_topic:
    "Sugira TEMAS de post para Instagram. Cada sugestão é um tema pronto, específico e com gancho (ex.: '5 erros que espantam clientes de [nicho]'). Nada genérico.",
  post_tone:
    "Sugira TONS de comunicação para um post (2 a 4 palavras cada, ex.: 'provocador e direto', 'acolhedor e didático'). Coerentes com o estilo da marca.",
  post_notes:
    "Sugira OBSERVAÇÕES úteis para orientar a geração de um post (restrições, contexto e diretrizes curtas, ex.: 'não usar clichês de vendas, focar em prova social').",
  image_prompt:
    "Sugira DESCRIÇÕES VISUAIS para a arte de um post (cena, elementos e clima, ex.: 'prato artesanal em mesa de madeira, luz quente de fim de tarde, estilo editorial').",
  brand_description:
    "Sugira DESCRIÇÕES DE MARCA curtas (1 a 2 frases) que resumam o diferencial e a personalidade do negócio.",
};

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY não configurada." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { field?: string; context?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const field = body.field as SuggestField;
  if (!field || !(field in FIELD_INSTRUCTIONS)) {
    return NextResponse.json({ error: "Campo inválido" }, { status: 400 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "business_name, niche, target_audience, communication_style, main_goal, brand_description, platforms",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const contextLines = Object.entries(body.context || {})
    .filter(([, v]) => typeof v === "string" && v.trim())
    .map(([k, v]) => `- ${k}: ${String(v).slice(0, 200)}`)
    .join("\n");

  const prompt = `Você gera sugestões de preenchimento para um app de marketing de pequenos negócios brasileiros.

PERFIL DO NEGÓCIO (use como base — as sugestões devem seguir o padrão destes dados):
- Negócio: ${business?.business_name || "não informado"}
- Nicho: ${business?.niche || "não informado"}
- Público-alvo: ${business?.target_audience || "não informado"}
- Estilo de comunicação: ${business?.communication_style || "não informado"}
- Objetivo principal: ${business?.main_goal || "não informado"}
- Descrição da marca: ${business?.brand_description || "não informada"}
${contextLines ? `\nCONTEXTO ATUAL DO FORMULÁRIO:\n${contextLines}` : ""}

TAREFA: ${FIELD_INSTRUCTIONS[field]}

REGRAS:
- Exatamente 3 sugestões, em português do Brasil, com acentuação correta.
- Curtas o bastante para caber num campo de formulário.
- Específicas para ESTE negócio e nicho (nunca genéricas tipo "dicas incríveis").
- Responda APENAS com JSON válido: {"suggestions": ["...", "...", "..."]}`;

  let lastError: unknown = null;
  for (const modelId of MODELS) {
    try {
      const result = await generateText({
        model: groq(modelId),
        prompt,
        temperature: 0.9,
        maxOutputTokens: 400,
      });
      const cleaned = result.text
        .replace(/```json|```/g, "")
        .trim()
        .match(/\{[\s\S]*\}/)?.[0];
      if (!cleaned) throw new Error("Sem JSON na resposta");
      const parsed = JSON.parse(cleaned) as { suggestions?: unknown };
      const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions
            .filter((s): s is string => typeof s === "string" && !!s.trim())
            .slice(0, 3)
        : [];
      if (suggestions.length === 0) throw new Error("Lista vazia");
      return NextResponse.json({ ok: true, suggestions });
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  console.warn("[suggest-input] falha em todos os modelos:", lastError);
  return NextResponse.json(
    { error: "Não foi possível gerar sugestões agora." },
    { status: 502 },
  );
}
