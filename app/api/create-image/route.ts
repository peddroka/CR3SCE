import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  composeImage,
  type ComposeFormat,
  type ComposeStyle,
} from "@/lib/image-composition";
import { fetchBackgroundImage } from "@/lib/image-composition/fetch-background";

export const runtime = "nodejs";
export const maxDuration = 60;

const GENERATION_LIMIT = 10;

interface BusinessContext {
  business_name: string;
  niche: string;
  brand_colors?: string[] | null;
  logo_url?: string | null;
}

function normalizeFormat(value: unknown): ComposeFormat {
  return value === "story" ? "story" : "feed";
}

function normalizeStyle(value: unknown): ComposeStyle {
  if (value === "light" || value === "colorful" || value === "minimal") {
    return value;
  }

  return "dark";
}

function getStyleLabel(style: ComposeStyle) {
  if (style === "light") return "Claro moderno";
  if (style === "colorful") return "Colorido vibrante";
  if (style === "minimal") return "Minimalista";
  return "Escuro premium";
}

function extractPostTheme(
  title: string,
  visualPrompt: string,
  business: BusinessContext,
) {
  if (title.trim()) {
    return title.trim();
  }

  const quoted = visualPrompt.match(/"([^"]+)"/);
  if (quoted?.[1]?.trim()) {
    return quoted[1].trim();
  }

  return `conteúdo sobre ${business.niche}`;
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildSubtitle(business: BusinessContext) {
  return `${business.business_name} - ${business.niche}`;
}

function buildDynamicImagePrompt(params: {
  postTheme: string;
  backgroundLabel: string;
  elementLabel: string;
  styleLabel: string;
}) {
  return [
    "Crie uma imagem profissional para post de Instagram.",
    `Tema: ${params.postTheme}.`,
    `Fundo: ${params.backgroundLabel}.`,
    `Elemento: ${params.elementLabel}.`,
    `Estilo: ${params.styleLabel}.`,
    "Sem texto, sem nome de empresa, sem logotipo.",
    "Qualidade de agência.",
  ].join(" ");
}

function getCombinationOffset(parts: Array<string | null | undefined>) {
  const seed = parts.filter(Boolean).join("|");

  return Array.from(seed).reduce((total, char, index) => {
    return (total + char.charCodeAt(0) * (index + 1)) % 97;
  }, 0);
}

async function getRecentGenerationCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("image_generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  if (error) {
    console.error("Erro ao contar gerações de imagem:", error);
    return 0;
  }

  return count ?? 0;
}

async function registerGeneration(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { error } = await supabase.from("image_generations").insert({
    user_id: userId,
  });

  if (error) {
    console.error("Erro ao registrar geração de imagem:", error);
  }
}

async function getBusinessContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: business, error } = await supabase
    .from("businesses")
    .select("business_name, niche, brand_colors, logo_url")
    .eq("user_id", userId)
    .maybeSingle<BusinessContext>();

  if (error) {
    throw error;
  }

  return business;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const count = await getRecentGenerationCount(supabase, user.id);

    return NextResponse.json({
      remaining: Math.max(0, GENERATION_LIMIT - count),
      used: count,
      limit: GENERATION_LIMIT,
    });
  } catch (error) {
    console.error("Erro ao consultar limite de gerações:", error);
    return NextResponse.json(
      { error: "Não foi possível consultar o limite agora." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const currentCount = await getRecentGenerationCount(supabase, user.id);
    if (currentCount >= GENERATION_LIMIT) {
      return NextResponse.json(
        {
          error: "Limite de 10 gerações por hora atingido. Tente novamente mais tarde.",
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const visualPrompt = String(body.visualPrompt || "").trim();
    const requestedFormat = normalizeFormat(body.format);
    const requestedStyle = normalizeStyle(body.style);
    const selectedBgUrl =
      normalizeOptionalString(body.selectedBgUrl) ??
      normalizeOptionalString(body.selectedBg);
    const selectedBgLabel =
      normalizeOptionalString(body.selectedBgLabel) ?? "fundo automático";
    const selectedElementUrl =
      normalizeOptionalString(body.selectedElementUrl) ??
      normalizeOptionalString(body.selectedElement);
    const selectedElementLabel =
      normalizeOptionalString(body.selectedElementLabel) ?? "sem elemento extra";
    const attempt = Number(body.attempt || 0);
    const providedTitle =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Conteúdo exclusivo";

    if (!visualPrompt) {
      return NextResponse.json(
        { error: "Prompt visual não informado." },
        { status: 400 },
      );
    }

    const business = await getBusinessContext(supabase, user.id);
    if (!business) {
      return NextResponse.json(
        { error: "Negócio não encontrado para este usuário." },
        { status: 404 },
      );
    }

    const postTheme = extractPostTheme(providedTitle, visualPrompt, business);
    const styleLabel = getStyleLabel(requestedStyle);
    const backgroundLabel =
      selectedBgLabel && selectedBgLabel !== "fundo automático"
        ? selectedBgLabel
        : selectedBgUrl
          ? selectedBgLabel
          : "fundo automático com base no tema";
    const elementLabel = selectedElementUrl
      ? selectedElementLabel
      : "sem elemento extra";
    const generationPrompt = buildDynamicImagePrompt({
      postTheme,
      backgroundLabel,
      elementLabel,
      styleLabel,
    });

    const combinationOffset = getCombinationOffset([
      visualPrompt,
      requestedStyle,
      selectedBgUrl,
      selectedBgLabel,
      selectedElementUrl,
      selectedElementLabel,
      String(attempt),
    ]);
    const orientation = requestedFormat === "story" ? "portrait" : "squarish";
    const bgUrl =
      selectedBgUrl ??
      (await fetchBackgroundImage(
        generationPrompt,
        attempt + combinationOffset,
        orientation,
      ));

    const mainImage = await composeImage({
      bgUrl,
      elementUrl: selectedElementUrl,
      format: requestedFormat,
      style: requestedStyle,
      business,
      visualPrompt: generationPrompt,
      title: providedTitle,
      subtitle: buildSubtitle(business),
      cta: "Siga para mais conteúdo",
    });

    const alternateFormat: ComposeFormat =
      requestedFormat === "feed" ? "story" : "feed";

    const alternateImage = await composeImage({
      bgUrl,
      elementUrl: selectedElementUrl,
      format: alternateFormat,
      style: requestedStyle,
      business,
      visualPrompt: generationPrompt,
      title: providedTitle,
      subtitle: buildSubtitle(business),
      cta: "Siga para mais conteúdo",
    });

    await registerGeneration(supabase, user.id);

    return NextResponse.json({
      image: `data:image/jpeg;base64,${mainImage.toString("base64")}`,
      alternateImage: `data:image/jpeg;base64,${alternateImage.toString("base64")}`,
      format: requestedFormat,
      alternateFormat,
      remaining: Math.max(0, GENERATION_LIMIT - currentCount - 1),
      generationPrompt,
    });
  } catch (error: any) {
    console.error("Erro ao criar imagem:", error);
    return NextResponse.json(
      {
        error: error?.message || "Erro ao criar imagem.",
      },
      { status: 500 },
    );
  }
}
