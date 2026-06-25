import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchBackgroundOptions } from "@/lib/image-composition/fetch-background";

interface ImageOption {
  id: string;
  url: string;
  label: string;
}

type ElementKind =
  | "phone"
  | "laptop"
  | "instagram"
  | "chart"
  | "coin"
  | "cart"
  | "target"
  | "brush"
  | "mirror"
  | "bottle"
  | "scissors"
  | "comb"
  | "razor"
  | "dumbbell"
  | "stopwatch"
  | "plate"
  | "cup"
  | "forkknife"
  | "chip"
  | "cloud"
  | "hanger"
  | "bag"
  | "spark";

interface ThemeConfig {
  id: string;
  label: string;
  accent: string;
  keywords: string[];
  elements: Array<{ kind: ElementKind; label: string }>;
}

const THEMES: ThemeConfig[] = [
  {
    id: "marketing-digital",
    label: "marketing digital",
    accent: "#C8F135",
    keywords: [
      "marketing digital",
      "instagram",
      "conteudo",
      "trafego",
      "social media",
      "lancamento",
      "engajamento",
    ],
    elements: [
      { kind: "phone", label: "Celular" },
      { kind: "laptop", label: "Notebook" },
      { kind: "instagram", label: "Instagram" },
      { kind: "chart", label: "Gráfico de crescimento" },
    ],
  },
  {
    id: "vendas",
    label: "vendas",
    accent: "#F4D35E",
    keywords: [
      "vendas",
      "vender",
      "fechamento",
      "oferta",
      "conversao",
      "cliente",
      "negociacao",
    ],
    elements: [
      { kind: "coin", label: "Moeda" },
      { kind: "cart", label: "Carrinho" },
      { kind: "target", label: "Meta" },
      { kind: "chart", label: "Crescimento" },
    ],
  },
  {
    id: "beleza",
    label: "beleza",
    accent: "#FF8FAB",
    keywords: ["beleza", "make", "maquiagem", "estetica", "salon", "salao"],
    elements: [
      { kind: "brush", label: "Pincel" },
      { kind: "mirror", label: "Espelho" },
      { kind: "bottle", label: "Frasco" },
      { kind: "spark", label: "Brilho" },
    ],
  },
  {
    id: "barbearia",
    label: "barbearia",
    accent: "#7BD389",
    keywords: ["barbearia", "barbear", "barber", "corte", "barba"],
    elements: [
      { kind: "scissors", label: "Tesoura" },
      { kind: "comb", label: "Pente" },
      { kind: "razor", label: "Navalha" },
      { kind: "mirror", label: "Espelho" },
    ],
  },
  {
    id: "fitness",
    label: "fitness",
    accent: "#5BC0EB",
    keywords: ["fitness", "academia", "treino", "musculacao", "saude"],
    elements: [
      { kind: "dumbbell", label: "Halter" },
      { kind: "stopwatch", label: "Cronômetro" },
      { kind: "chart", label: "Evolução" },
      { kind: "target", label: "Meta" },
    ],
  },
  {
    id: "gastronomia",
    label: "gastronomia",
    accent: "#F97316",
    keywords: ["restaurante", "hamburguer", "pizza", "comida", "cafe", "padaria"],
    elements: [
      { kind: "plate", label: "Prato" },
      { kind: "cup", label: "Xícara" },
      { kind: "forkknife", label: "Talheres" },
      { kind: "spark", label: "Destaque" },
    ],
  },
  {
    id: "tecnologia",
    label: "tecnologia",
    accent: "#62B6CB",
    keywords: ["tecnologia", "tech", "software", "sistema", "aplicativo"],
    elements: [
      { kind: "phone", label: "Celular" },
      { kind: "laptop", label: "Notebook" },
      { kind: "chip", label: "Chip" },
      { kind: "cloud", label: "Nuvem" },
    ],
  },
  {
    id: "moda",
    label: "moda",
    accent: "#C084FC",
    keywords: ["moda", "fashion", "roupa", "look", "loja"],
    elements: [
      { kind: "hanger", label: "Cabide" },
      { kind: "bag", label: "Bolsa" },
      { kind: "spark", label: "Estilo" },
      { kind: "target", label: "Destaque" },
    ],
  },
];

const DEFAULT_THEME: ThemeConfig = {
  id: "negocio",
  label: "negócio",
  accent: "#C8F135",
  keywords: [],
  elements: [
    { kind: "phone", label: "Celular" },
    { kind: "laptop", label: "Notebook" },
    { kind: "chart", label: "Crescimento" },
    { kind: "target", label: "Objetivo" },
  ],
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePrompt(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectTheme(prompt: string) {
  const normalized = normalizePrompt(prompt);

  for (const theme of THEMES) {
    if (theme.keywords.some((keyword) => normalized.includes(keyword))) {
      return theme;
    }
  }

  return DEFAULT_THEME;
}

function toDataUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildIconMarkup(kind: ElementKind, accent: string) {
  const common =
    'fill="none" stroke="' +
    accent +
    '" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"';

  switch (kind) {
    case "phone":
      return `<rect x="115" y="55" width="130" height="250" rx="28" ${common}/><circle cx="180" cy="278" r="8" fill="${accent}" />`;
    case "laptop":
      return `<rect x="85" y="80" width="190" height="130" rx="18" ${common}/><path d="M60 250h240l-20 35H80z" ${common}/>`;
    case "instagram":
      return `<rect x="80" y="80" width="200" height="200" rx="56" ${common}/><circle cx="180" cy="180" r="48" ${common}/><circle cx="245" cy="115" r="10" fill="${accent}" />`;
    case "chart":
      return `<path d="M85 285V95" ${common}/><path d="M85 285H285" ${common}/><path d="M120 235l45-50 40 24 60-79" ${common}/>`;
    case "coin":
      return `<ellipse cx="160" cy="180" rx="55" ry="78" ${common}/><path d="M200 155c-8-10-22-16-40-16-22 0-38 10-38 27 0 16 13 24 37 28 24 4 37 10 37 27 0 18-16 29-40 29-18 0-33-6-43-17" ${common}/>`;
    case "cart":
      return `<circle cx="140" cy="270" r="16" ${common}/><circle cx="235" cy="270" r="16" ${common}/><path d="M78 95h28l18 116h117l24-85H122" ${common}/>`;
    case "target":
      return `<circle cx="180" cy="180" r="88" ${common}/><circle cx="180" cy="180" r="52" ${common}/><circle cx="180" cy="180" r="18" fill="${accent}" /><path d="M238 122l58-58" ${common}/><path d="M241 91h57v57" ${common}/>`;
    case "brush":
      return `<path d="M118 245c0-28 18-46 46-46 16 0 28 6 39 17" ${common}/><path d="M184 92l58 58-77 77-58-58z" ${common}/>`;
    case "mirror":
      return `<ellipse cx="180" cy="145" rx="70" ry="88" ${common}/><path d="M180 233v65" ${common}/><path d="M140 310h80" ${common}/>`;
    case "bottle":
      return `<path d="M155 78h50" ${common}/><path d="M165 78v34l-25 32v116c0 18 14 32 32 32h16c18 0 32-14 32-32V144l-25-32V78" ${common}/>`;
    case "scissors":
      return `<circle cx="132" cy="228" r="28" ${common}/><circle cx="228" cy="228" r="28" ${common}/><path d="M152 208 258 100" ${common}/><path d="M152 248 258 140" ${common}/>`;
    case "comb":
      return `<rect x="80" y="120" width="200" height="55" rx="16" ${common}/><path d="M98 175v70M122 175v70M146 175v70M170 175v70M194 175v70M218 175v70M242 175v70" ${common}/>`;
    case "razor":
      return `<path d="M110 125h90c20 0 36 16 36 36v18H165" ${common}/><path d="M164 179l-34 88" ${common}/><path d="M220 125V84h48" ${common}/>`;
    case "dumbbell":
      return `<path d="M118 135v90M142 118v124M218 118v124M242 135v90M142 180h76" ${common}/>`;
    case "stopwatch":
      return `<circle cx="180" cy="190" r="88" ${common}/><path d="M180 68v28" ${common}/><path d="M148 62h64" ${common}/><path d="M180 190l36-34" ${common}/><path d="M180 145v45" ${common}/>`;
    case "plate":
      return `<circle cx="180" cy="180" r="92" ${common}/><circle cx="180" cy="180" r="52" ${common}/>`;
    case "cup":
      return `<path d="M112 112h112v62c0 42-26 72-56 72s-56-30-56-72z" ${common}/><path d="M224 130h28c18 0 18 44 0 44h-28" ${common}/><path d="M122 274h92" ${common}/>`;
    case "forkknife":
      return `<path d="M122 72v78M144 72v78M166 72v78M144 150v140" ${common}/><path d="M226 72v100l-28 32v86" ${common}/>`;
    case "chip":
      return `<rect x="110" y="110" width="140" height="140" rx="22" ${common}/><path d="M145 78v32M180 78v32M215 78v32M145 250v32M180 250v32M215 250v32M78 145h32M78 180h32M78 215h32M250 145h32M250 180h32M250 215h32" ${common}/>`;
    case "cloud":
      return `<path d="M120 236h108c33 0 57-22 57-50 0-31-26-53-56-50-9-38-37-61-75-61-45 0-80 33-82 79-25 4-44 24-44 50 0 30 25 52 59 52h33" ${common}/>`;
    case "hanger":
      return `<path d="M180 102c0-18 14-30 31-30 15 0 27 10 27 25 0 12-7 20-20 29" ${common}/><path d="M84 222l96-76 96 76" ${common}/><path d="M84 222h192" ${common}/>`;
    case "bag":
      return `<rect x="104" y="118" width="152" height="158" rx="18" ${common}/><path d="M138 118c0-24 18-42 42-42s42 18 42 42" ${common}/>`;
    case "spark":
      return `<path d="M180 70l24 64 64 24-64 24-24 64-24-64-64-24 64-24z" ${common}/>`;
  }
}

function buildElementSvg(kind: ElementKind, accent: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="${accent}" flood-opacity="0.45" />
      </filter>
    </defs>
    <g filter="url(#glow)">
      ${buildIconMarkup(kind, accent)}
    </g>
  </svg>`;

  return toDataUrl(svg);
}

function buildElementOptions(prompt: string): ImageOption[] {
  const theme = detectTheme(prompt);

  return theme.elements.map((element, index) => ({
    id: `${theme.id}-${slugify(element.label)}-${index}`,
    url: buildElementSvg(element.kind, theme.accent),
    label: element.label,
  }));
}

function buildBackgroundOptions(prompt: string, urls: string[]): ImageOption[] {
  const theme = detectTheme(prompt);

  return urls.map((url, index) => ({
    id: `bg-${index + 1}`,
    url,
    label: `Fundo ${index + 1} para ${theme.label}`,
  }));
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const prompt = req.nextUrl.searchParams.get("prompt") ?? "";
    const format = req.nextUrl.searchParams.get("format");
    const orientation = format === "story" ? "portrait" : "squarish";

    const backgrounds = buildBackgroundOptions(
      prompt,
      await fetchBackgroundOptions(prompt, orientation),
    );
    const elements = buildElementOptions(prompt);

    return NextResponse.json({ backgrounds, elements });
  } catch (error) {
    console.error("Erro ao buscar opções de imagem:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as opções de personalização." },
      { status: 500 },
    );
  }
}
