"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  Loader2,
  Camera,
  X,
  AlertCircle,
  Star,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient, getUserSafely } from "@/lib/supabase/client";

const MAX_ANALYSES_PER_MONTH = 4;

interface Improvement {
  area: string;
  current: string;
  suggestion: string;
  example?: string;
}

interface ScoreResult {
  score: number;
  grade: string;
  summary: string;
  nota_geral?: number;
  classificacao?: string;
  resumo?: string;
  criterios?: {
    id: string;
    nome: string;
    nota: number;
    peso: number;
    status: string;
    feedback: string;
    acoes: string[];
  }[];
  melhorias_prioritarias?: {
    prioridade: number;
    criterio: string;
    impacto: string;
    descricao: string;
    sugestao_concreta: string;
  }[];
  pontos_fortes?: string[];
  proximos_passos?: string;
  problems: {
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }[];
  bios: { option: number; text: string; explanation: string }[];
  tips: string[];
  improvements: Improvement[];
}

interface Props {
  business: any;
  analysisCount: number;
  lastAnalysis: any;
}

type PreviewFieldKey =
  | "photo"
  | "name"
  | "category"
  | "bio"
  | "link"
  | "posts";

interface ResolvedImprovement extends Improvement {
  key: PreviewFieldKey;
  label: string;
}

interface ProfilePreviewData {
  handle: string;
  headerName: string;
  fullName: string;
  category: string;
  bio: string;
  link: string;
  avatarUrl: string | null;
  avatarStyle: "plain" | "improved";
  postTiles: string[];
  postsCount: string;
  followersCount: string;
  followingCount: string;
}

const PREVIEW_AREA_CONFIG: Array<{
  key: PreviewFieldKey;
  label: string;
  keywords: string[];
}> = [
  {
    key: "photo",
    label: "Foto de perfil",
    keywords: ["foto", "logo", "logomarca", "perfil"],
  },
  {
    key: "name",
    label: "Nome do perfil",
    keywords: ["nome de exibicao", "nome de pesquisa", "nome", "usuario", "handle"],
  },
  {
    key: "category",
    label: "Categoria",
    keywords: ["categoria"],
  },
  {
    key: "bio",
    label: "Bio",
    keywords: ["bio", "descricao", "descrição"],
  },
  {
    key: "link",
    label: "Link",
    keywords: ["link", "cta", "contato", "whatsapp", "direct"],
  },
  {
    key: "posts",
    label: "Grade de posts",
    keywords: ["post", "posts", "grade", "feed", "conteudo", "conteúdo"],
  },
];

function normalizeDisplayText(value: string): string {
  let result = value || "";

  for (let i = 0; i < 2; i += 1) {
    if (!/[ÃÂâð]/.test(result)) break;

    try {
      result = decodeURIComponent(escape(result));
    } catch {
      break;
    }
  }

  return result.replace(/\uFFFD/g, "").trim();
}

function simplifyText(value: string) {
  return normalizeDisplayText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function truncateText(value: string, maxLength: number) {
  const cleaned = normalizeDisplayText(value).replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 3).trim()}...`;
}

function sanitizeHandle(handle?: string | null, businessName?: string) {
  const raw = normalizeDisplayText(handle || "").replace(/^@+/, "");

  if (raw) {
    return raw.toLowerCase().replace(/\s+/g, "");
  }

  return normalizeDisplayText(businessName || "seuperfil")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18) || "seuperfil";
}

function createDefaultBio(name: string, niche: string) {
  const shortName = truncateText(name, 28);
  const shortNiche = truncateText(niche || "negócio local", 38);

  return `${shortName}\n${shortNiche}\nFale com a gente no link abaixo`;
}

function formatBioLines(value: string) {
  const cleaned = normalizeDisplayText(value).replace(/\s*\|\s*/g, "\n");
  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  return lines.join("\n");
}

function getGridPalette(style: "current" | "improved") {
  if (style === "improved") {
    return [
      "from-[#0f172a] to-[#1d4ed8]",
      "from-[#111827] to-[#2563eb]",
      "from-[#172554] to-[#0f766e]",
      "from-[#0f172a] to-[#334155]",
      "from-[#1e293b] to-[#0f766e]",
      "from-[#111827] to-[#1d4ed8]",
    ];
  }

  return [
    "from-[#2b2b2b] to-[#101010]",
    "from-[#161616] to-[#3a3a3a]",
    "from-[#232323] to-[#141414]",
    "from-[#3b2f20] to-[#171717]",
    "from-[#261b2f] to-[#101010]",
    "from-[#2b2b2b] to-[#181818]",
  ];
}

function matchImprovementKey(improvement: Improvement): PreviewFieldKey | null {
  const haystack = simplifyText(
    `${improvement.area} ${improvement.current} ${improvement.suggestion} ${improvement.example || ""}`,
  );

  const config = PREVIEW_AREA_CONFIG.find((item) =>
    item.keywords.some((keyword) => haystack.includes(simplifyText(keyword))),
  );

  return config?.key || null;
}

function inferProblemPreviewKeys(
  problems: { title: string; description: string }[],
) {
  const matched = new Set<PreviewFieldKey>();

  problems.forEach((problem) => {
    const haystack = simplifyText(`${problem.title} ${problem.description}`);

    PREVIEW_AREA_CONFIG.forEach((config) => {
      if (
        config.keywords.some((keyword) => haystack.includes(simplifyText(keyword)))
      ) {
        matched.add(config.key);
      }
    });
  });

  return matched;
}

function buildResolvedImprovements(
  improvements: Improvement[],
  problems: { title: string; description: string }[] = [],
) {
  const seen = new Set<PreviewFieldKey>();
  const problemKeys = inferProblemPreviewKeys(problems);

  return improvements.reduce<ResolvedImprovement[]>((acc, improvement) => {
    const key = matchImprovementKey(improvement);

    if (!key || seen.has(key)) {
      return acc;
    }

    if (problemKeys.size > 0 && !problemKeys.has(key)) {
      return acc;
    }

    const config = PREVIEW_AREA_CONFIG.find((item) => item.key === key);

    if (!config) {
      return acc;
    }

    seen.add(key);
    acc.push({
      ...improvement,
      key,
      label: config.label,
    });
    return acc;
  }, []);
}

function buildPreviewData(
  business: any,
  bios: { text: string }[],
  resolvedImprovements: ResolvedImprovement[],
) {
  const handle = sanitizeHandle(business?.instagram_handle, business?.business_name);
  const fullName = truncateText(
    normalizeDisplayText(business?.business_name || "Nome do negócio"),
    32,
  );
  const category = truncateText(
    normalizeDisplayText(business?.niche || "Categoria do perfil"),
    32,
  );
  const defaultBio = formatBioLines(createDefaultBio(fullName, category));
  const bestBio = formatBioLines(
    bios?.[0]?.text ? truncateText(bios[0].text, 150) : defaultBio,
  );
  const logoUrl = normalizeDisplayText(business?.logo_url || "") || null;
  const currentBioImp = resolvedImprovements.find((item) => item.key === "bio");
  const currentLinkImp = resolvedImprovements.find((item) => item.key === "link");
  const currentNameImp = resolvedImprovements.find((item) => item.key === "name");
  const currentCategoryImp = resolvedImprovements.find((item) => item.key === "category");
  const hasPhotoChange = resolvedImprovements.some((item) => item.key === "photo");
  const hasPostsChange = resolvedImprovements.some((item) => item.key === "posts");

  const currentBio =
    currentBioImp?.current && currentBioImp.current.length <= 160
      ? formatBioLines(currentBioImp.current)
      : defaultBio;

  const currentLink =
    currentLinkImp?.current && currentLinkImp.current.length <= 60
      ? truncateText(currentLinkImp.current, 42)
      : `linktr.ee/${handle}`;

  const currentName =
    currentNameImp?.current && currentNameImp.current.length <= 42
      ? truncateText(currentNameImp.current, 32)
      : fullName;

  const currentCategory =
    currentCategoryImp?.current && currentCategoryImp.current.length <= 42
      ? truncateText(currentCategoryImp.current, 32)
      : category;

  const improvedNameImp = resolvedImprovements.find((item) => item.key === "name");
  const improvedCategoryImp = resolvedImprovements.find((item) => item.key === "category");
  const improvedBioImp = resolvedImprovements.find((item) => item.key === "bio");
  const improvedLinkImp = resolvedImprovements.find((item) => item.key === "link");

  const improvedName = improvedNameImp?.example
    ? truncateText(improvedNameImp.example, 32)
    : improvedNameImp
      ? truncateText(`${fullName} | ${category}`, 32)
      : currentName;

  const improvedCategory = improvedCategoryImp?.example
    ? truncateText(improvedCategoryImp.example, 32)
    : currentCategory;

  const improvedBio = improvedBioImp ? bestBio : currentBio;
  const improvedLink = improvedLinkImp?.example
    ? truncateText(improvedLinkImp.example, 42)
    : improvedLinkImp
      ? truncateText(`wa.me/55${handle.slice(0, 9) || "11999999999"}`, 42)
      : currentLink;

  const counts = {
    postsCount: "18",
    followersCount: "245",
    followingCount: "132",
  };

  return {
    current: {
      handle,
      headerName: handle,
      fullName: currentName,
      category: currentCategory,
      bio: currentBio,
      link: currentLink,
      avatarUrl: logoUrl,
      avatarStyle: "plain" as const,
      postTiles: getGridPalette("current"),
      ...counts,
    },
    improved: {
      handle,
      headerName: handle,
      fullName: improvedName,
      category: improvedCategory,
      bio: improvedBio,
      link: improvedLink,
      avatarUrl: hasPhotoChange ? null : logoUrl,
      avatarStyle: hasPhotoChange ? ("improved" as const) : ("plain" as const),
      postTiles: getGridPalette(hasPostsChange ? "improved" : "current"),
      ...counts,
    },
  };
}

function getDisplayScore(result: ScoreResult) {
  if (typeof result.score === "number" && result.score > 0) {
    return result.score;
  }

  if (typeof result.nota_geral === "number") {
    return Math.round(result.nota_geral * 10);
  }

  return 0;
}

function getDisplayGrade(result: ScoreResult) {
  return normalizeDisplayText(result.grade || result.classificacao || "Perfil em desenvolvimento");
}

function getDisplaySummary(result: ScoreResult) {
  return normalizeDisplayText(result.summary || result.resumo || "");
}

export function ScoreClient({
  business,
  analysisCount,
  lastAnalysis,
}: Props) {
  const [, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(() => {
    const urls: string[] = [];
    if (business?.bio_screenshot_url) urls.push(business.bio_screenshot_url);
    if (business?.bio_screenshots?.length > 1) {
      urls.push(business.bio_screenshots[1]);
    }
    return urls;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(
    lastAnalysis
      ? {
          score: lastAnalysis.score,
          grade: lastAnalysis.grade,
          summary: lastAnalysis.summary,
          nota_geral: lastAnalysis.nota_geral,
          classificacao: lastAnalysis.classificacao,
          resumo: lastAnalysis.resumo,
          criterios: lastAnalysis.criterios,
          melhorias_prioritarias: lastAnalysis.melhorias_prioritarias,
          pontos_fortes: lastAnalysis.pontos_fortes,
          proximos_passos: lastAnalysis.proximos_passos,
          problems: lastAnalysis.problems,
          bios: lastAnalysis.bios,
          tips: lastAnalysis.tips,
          improvements: lastAnalysis.improvements || [],
        }
      : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [remainingAnalyses, setRemainingAnalyses] = useState(
    MAX_ANALYSES_PER_MONTH - analysisCount,
  );
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (imagePreviews.length > 0 && !lastAnalysis && remainingAnalyses > 0) {
      void analyzeProfile();
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviews: string[] = [];
    let loaded = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target?.result as string);
        loaded++;
        if (loaded === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 2));
        }
      };
      reader.readAsDataURL(file);
    });

    setImages((prev) => [...prev, ...files].slice(0, 2));
    setResult(null);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const analyzeProfile = async () => {
    if (imagePreviews.length === 0) return;
    if (remainingAnalyses <= 0) {
      setError("Você atingiu o limite de 4 análises este mês. Volte no mês que vem.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Images: string[] = [];
      for (const preview of imagePreviews) {
        if (/^https?:\/\//.test(preview)) {
          const response = await fetch(preview);
          const blob = await response.blob();
          base64Images.push(await blobToDataUrl(blob));
        } else {
          base64Images.push(preview);
        }
      }

      const res = await fetch("/api/score-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: base64Images,
          niche: business?.niche,
          business_name: business?.business_name,
          previous_problems: result?.problems || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
      setRemainingAnalyses((prev) => prev - 1);

      const { user } = await getUserSafely(supabase);
      if (user) {
        await supabase.from("profile_scores").insert({
          user_id: user.id,
          score: data.score,
          grade: data.grade,
          summary: data.summary,
          problems: data.problems,
          bios: data.bios,
          tips: data.tips,
          improvements: data.improvements || [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao analisar perfil");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#C8F135";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  function AnnotationCard({
    label,
    suggestion,
    example,
    side,
  }: {
    label: string;
    suggestion: string;
    example?: string;
    side: "left" | "right";
  }) {
    return (
      <div
        className={`flex items-start gap-1 ${
          side === "right" ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <div className="flex-1 rounded-xl border border-[#C8F135]/25 bg-[#0d0d0d] p-3 shadow-lg">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[#C8F135]">
            {label}
          </p>
          <p className="text-[10px] leading-relaxed text-white/80">
            {suggestion}
          </p>
          {example && (
            <div className="mt-1.5 rounded-lg border border-[#C8F135]/20 bg-[#C8F135]/5 p-1.5">
              <p className="text-[9px] italic text-white/70">"{example}"</p>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center pt-4">
          {side === "right" ? (
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
              <path
                d="M2 14 C8 8, 18 6, 30 14 M30 14 L23 8 M30 14 L23 20"
                stroke="#C8F135"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
              <path
                d="M34 14 C28 8, 18 6, 6 14 M6 14 L13 8 M6 14 L13 20"
                stroke="#C8F135"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    );
  }

  function MockupPhone({
    timeStr,
    handle,
    name,
    niche,
    bestBio,
    highlight,
  }: {
    timeStr: string;
    handle: string;
    name: string;
    niche: string;
    bestBio: string;
    highlight: string | null;
  }) {
    const highlightStyles: Record<string, CSSProperties> = {
      foto: { top: 62, left: 14, width: 74, height: 74 },
      nome: { top: 148, left: 14, width: 180, height: 20 },
      categoria: { top: 168, left: 14, width: 140, height: 16 },
      bio: { top: 184, left: 14, width: 256, height: 52 },
      link: { top: 236, left: 14, width: 160, height: 16 },
      destaques: { top: 256, left: 14, width: 256, height: 76 },
      painel: { top: 338, left: 14, width: 256, height: 40 },
    };

    const hl = highlight ? highlightStyles[highlight] : null;

    return (
      <div
        className="relative overflow-hidden rounded-[36px] border-[3px] border-[#2a2a2a] bg-[#000] shadow-[0_0_60px_rgba(0,0,0,0.9)]"
        style={{ width: 284, minHeight: 520 }}
      >
        <div className="absolute left-1/2 top-2 z-10 h-4 w-24 -translate-x-1/2 rounded-full bg-[#000]" />

        <div className="flex items-center justify-between bg-[#000] px-5 pt-3 pb-1">
          <span className="text-[11px] font-bold text-white">{timeStr}</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-[2px]">
              {[2, 3, 4, 5].map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm bg-white"
                  style={{ height: h }}
                />
              ))}
            </div>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
              <path
                d="M7 1C9.8 1 12.3 2.2 14 4.2L7 10L0 4.2C1.7 2.2 4.2 1 7 1Z"
                opacity="0.9"
              />
            </svg>
            <div className="flex h-3.5 items-center gap-0.5 rounded-sm border border-white/40 px-0.5">
              <div className="h-2 w-4 rounded-sm bg-white" />
              <div className="h-2 w-0.5 rounded-sm bg-white/30" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#000] px-4 py-2">
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-bold text-white">@{handle}</span>
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
              <path
                d="M1 1l4 4 4-4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
            <div className="ml-1 size-2 rounded-full bg-red-500" />
          </div>
          <div className="flex items-center gap-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div className="flex flex-col gap-[3px]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[2px] w-5 rounded bg-white" />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#000] px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="flex size-[68px] items-center justify-center rounded-full border-2 border-[#333] bg-[#1a1a1a]">
                <span className="text-2xl font-black text-white/15">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-black bg-[#0095f6]">
                <span className="text-[10px] font-bold text-white">+</span>
              </div>
            </div>
            <div className="flex flex-1 justify-around text-center">
              {[["0", "posts"], ["235", "seguidores"], ["2", "seguindo"]].map(
                ([v, l]) => (
                  <div key={l}>
                    <p className="text-sm font-bold text-white">{v}</p>
                    <p className="text-[9px] text-white/60">{l}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="mt-2 space-y-[2px]">
            <p className="text-xs font-bold text-white">{name}</p>
            <p className="text-[10px] text-white/50">{niche}</p>
            <p className="whitespace-pre-line text-[10px] leading-relaxed text-white/85">
              {bestBio}
            </p>
            <p className="text-[10px] font-medium text-[#0095f6]">
              linktr.ee/{handle}
            </p>
          </div>

          <div className="mt-3 flex gap-3">
            {["Parceiros", "Serviços", "Equipe", "Contato"].map((hlName) => (
              <div
                key={hlName}
                className="flex shrink-0 flex-col items-center gap-1"
              >
                <div className="size-11 rounded-full border border-[#333] bg-[#111]" />
                <span className="text-[8px] text-white/60">{hlName}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-[#333] bg-[#111] px-3 py-2">
            <p className="text-[10px] font-semibold text-white">
              Painel profissional
            </p>
            <p className="text-[9px] text-[#0095f6]">
              {"↗"} 12 visualizações nos últimos 30 dias
            </p>
          </div>

          <div className="mt-2 flex gap-1.5">
            {["Editar", "Compartilhar p...", "Contato"].map((btn, i) => (
              <div
                key={btn}
                className={`rounded-lg bg-[#262626] py-1.5 text-center text-[9px] font-semibold text-white ${
                  i < 2 ? "flex-1" : "px-2"
                }`}
              >
                {btn}
              </div>
            ))}
          </div>

          <div className="mt-3 flex border-t border-[#262626] pt-1.5">
            {["⊞", "▷", "👤"].map((icon, i) => (
              <div
                key={i}
                className={`flex flex-1 justify-center py-1 text-sm ${
                  i === 0 ? "border-b-2 border-white text-white" : "text-white/25"
                }`}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        {hl && (
          <motion.div
            key={highlight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute rounded-lg border-2 border-[#C8F135] shadow-[0_0_16px_rgba(200,241,53,0.5)]"
            style={hl}
          />
        )}
      </div>
    );
  }

  function _InstagramMockup({
    business,
    improvements,
    bios,
  }: {
    business: any;
    improvements: any[];
    bios: any[];
  }) {
    const [mobileIndex, setMobileIndex] = useState(0);

    const handle = business?.instagram_handle || "seuarroba";
    const name = business?.business_name || "Nome do Negócio";
    const niche = business?.niche || "";
    const bestBio = bios?.[0]?.text || "";

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const getImp = (areas: string[]) =>
      improvements?.find((imp) =>
        areas.some((a) => imp.area?.toLowerCase().includes(a)),
      );

    const allAnnotations = [
      {
        key: "foto",
        label: "Foto de perfil",
        imp: getImp(["foto", "logo", "perfil"]),
        defaultSuggestion:
          "Use uma foto profissional ou logo com fundo limpo. Evite foto escura ou sem identidade visual clara.",
        defaultExample:
          "Logo com fundo branco ou colorido sólido, sem poluição visual",
      },
      {
        key: "nome",
        label: "Nome de exibição",
        imp: getImp(["nome", "exibicao"]),
        defaultSuggestion: `Adicione sua especialidade no nome. Ex: "${name} | Agência de Marketing". Isso aparece nas buscas do Instagram.`,
        defaultExample: `${name} | Marketing Digital`,
      },
      {
        key: "bio",
        label: "Bio",
        imp: getImp(["bio"]),
        defaultSuggestion:
          "A bio deve ter: o que você faz, para quem, resultado ou diferencial e um CTA claro.",
        defaultExample:
          bestBio ||
          "Ajudamos empresas a crescerem no digital | Tráfego pago + Social Media | Fale com a gente 👇",
      },
      {
        key: "link",
        label: "Link na bio",
        imp: getImp(["link"]),
        defaultSuggestion:
          "Use o Linktree ou um link direto para WhatsApp. O link é o principal conversor do perfil.",
        defaultExample: `wa.me/55xx9xxxx-xxxx ou linktr.ee/${handle}`,
      },
      {
        key: "destaques",
        label: "Destaques",
        imp: getImp(["destaque", "highlight"]),
        defaultSuggestion:
          "Organize os destaques com capas personalizadas. Categorias essenciais para agências:",
        defaultExample: "Parceiros | Serviços | Cases | Equipe | Contato",
      },
    ].map((a) => ({
      key: a.key,
      label: a.label,
      suggestion: a.imp?.suggestion || a.defaultSuggestion,
      example: a.imp?.example || a.defaultExample,
    }));

    const current = allAnnotations[mobileIndex];
    const leftAnnotations = allAnnotations.filter((a) =>
      ["foto", "link", "destaques"].includes(a.key),
    );
    const rightAnnotations = allAnnotations.filter((a) =>
      ["nome", "bio"].includes(a.key),
    );

    return (
      <div className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="size-4 text-[#C8F135]" />
          Seu perfil otimizado — veja como ficaria
        </p>

        <div className="hidden lg:flex items-start justify-center gap-6">
          <div className="flex w-52 flex-col gap-5 pt-12">
            {leftAnnotations.map((a) => (
              <AnnotationCard
                key={a.key}
                label={a.label}
                suggestion={a.suggestion}
                example={a.example}
                side="right"
              />
            ))}
          </div>

          <MockupPhone
            timeStr={timeStr}
            handle={handle}
            name={name}
            niche={niche}
            bestBio={bestBio}
            highlight={null}
          />

          <div className="flex w-52 flex-col gap-5 pt-20">
            {rightAnnotations.map((a) => (
              <AnnotationCard
                key={a.key}
                label={a.label}
                suggestion={a.suggestion}
                example={a.example}
                side="left"
              />
            ))}
          </div>
        </div>

        <div className="flex lg:hidden flex-col items-center gap-4">
          <MockupPhone
            timeStr={timeStr}
            handle={handle}
            name={name}
            niche={niche}
            bestBio={bestBio}
            highlight={current.key}
          />

          <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-[#C8F135]/30 bg-[#0d0d0d] shadow-xl">
            <div className="h-1 bg-[#C8F135]" />
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#C8F135]">
                  {current.label}
                </p>
                <p className="text-[10px] text-[#555]">
                  {mobileIndex + 1} / {allAnnotations.length}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-white/85">
                {current.suggestion}
              </p>
              {current.example && (
                <div className="mt-3 rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-3">
                  <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-[#C8F135]">
                    Exemplo pronto:
                  </p>
                  <p className="text-xs italic text-white/80">
                    "{current.example}"
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setMobileIndex((p) => Math.max(0, p - 1))}
                  disabled={mobileIndex === 0}
                  className="flex items-center gap-1 rounded-xl border border-border bg-white/5 px-4 py-2 text-xs text-white disabled:opacity-30"
                >
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path
                      d="M14 6 C10 3, 6 2, 2 6 M2 6 L6 3 M2 6 L6 9"
                      stroke="#C8F135"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Anterior
                </button>

                <div className="flex gap-1">
                  {allAnnotations.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMobileIndex(i)}
                      className={`rounded-full transition-all ${
                        i === mobileIndex
                          ? "w-4 h-1.5 bg-[#C8F135]"
                          : "size-1.5 bg-white/20"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setMobileIndex((p) =>
                      Math.min(allAnnotations.length - 1, p + 1),
                    )
                  }
                  disabled={mobileIndex === allAnnotations.length - 1}
                  className="flex items-center gap-1 rounded-xl border border-border bg-white/5 px-4 py-2 text-xs text-white disabled:opacity-30"
                >
                  Próxima
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path
                      d="M2 6 C6 3, 10 2, 14 6 M14 6 L10 3 M14 6 L10 9"
                      stroke="#C8F135"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ImprovementCardV2({
    item,
  }: {
    item: ResolvedImprovement;
  }) {
    return (
      <div className="rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C8F135]">
          {item.label}
        </p>
        <p className="text-sm leading-relaxed text-white/85">{normalizeDisplayText(item.suggestion)}</p>
        {item.example && (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Exemplo aplicado
            </p>
            <p className="text-xs leading-relaxed text-white/80">
              {normalizeDisplayText(item.example)}
            </p>
          </div>
        )}
      </div>
    );
  }

  function PhoneProfilePreviewV2({
    title,
    profile,
  }: {
    title: string;
    profile: ProfilePreviewData;
  }) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>

        <div className="rounded-[36px] border border-white/10 bg-[#050505] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black px-4 pb-4 pt-3">
            <div className="mb-4 flex items-center justify-between text-[11px] font-semibold text-white">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-end gap-[2px]">
                  {[4, 6, 8, 10].map((height, index) => (
                    <span
                      key={index}
                      className="w-[2px] rounded-full bg-white"
                      style={{ height }}
                    />
                  ))}
                </div>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path
                    d="M1 8.5C2.8 6.2 4.9 5 7 5C9.1 5 11.2 6.2 13 8.5"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 6.5C4.2 5.1 5.6 4.3 7 4.3C8.4 4.3 9.8 5.1 11 6.5"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <circle cx="7" cy="8.2" r="1" fill="white" />
                </svg>
                <div className="flex items-center rounded-[4px] border border-white/50 px-[2px] py-[1px]">
                  <div className="h-[6px] w-[16px] rounded-[2px] bg-white" />
                  <div className="ml-[2px] h-[4px] w-[2px] rounded-full bg-white/70" />
                </div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-[24px_1fr_44px] items-center">
              <div />
              <p className="text-center text-[13px] font-semibold text-white">
                @{profile.headerName}
              </p>
              <div className="flex items-center justify-end gap-3 text-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7H20M4 12H20M4 17H20"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#121212]">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center ${
                      profile.avatarStyle === "improved"
                        ? "bg-gradient-to-br from-[#C8F135] via-[#84cc16] to-[#1f2937]"
                        : "bg-gradient-to-br from-[#1b1b1b] to-[#2c2c2c]"
                    }`}
                  >
                    <span
                      className={`text-2xl font-black ${
                        profile.avatarStyle === "improved"
                          ? "text-[#111]"
                          : "text-white/75"
                      }`}
                    >
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid flex-1 grid-cols-3 gap-2 text-center">
                {[
                  [profile.postsCount, "posts"],
                  [profile.followersCount, "seguidores"],
                  [profile.followingCount, "seguindo"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="text-sm font-bold text-white">{value}</p>
                    <p className="text-[10px] text-white/55">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 space-y-1">
              <p className="text-[12px] font-bold text-white">{profile.fullName}</p>
              <p className="text-[10px] text-white/55">{profile.category}</p>
              <p className="whitespace-pre-line text-[10px] leading-[1.45] text-white/85">
                {profile.bio}
              </p>
              <p className="text-[10px] font-medium text-[#60a5fa]">{profile.link}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {profile.postTiles.map((tone, index) => (
                <div
                  key={`${title}-${index}`}
                  className={`aspect-square rounded-[12px] bg-gradient-to-br ${tone}`}
                >
                  <div className="flex h-full w-full items-end justify-between p-2">
                    <span className="h-2.5 w-10 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function InstagramMockupV2({
    business,
    improvements,
    bios,
    problems,
  }: {
    business: any;
    improvements: Improvement[];
    bios: { option: number; text: string; explanation: string }[];
    problems: { title: string; description: string }[];
  }) {
    const resolvedImprovements = buildResolvedImprovements(
      improvements || [],
      problems || [],
    );
    const preview = buildPreviewData(business, bios, resolvedImprovements);

    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="size-4 text-[#C8F135]" />
            Preview das melhorias
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#888]">
            O preview abaixo altera apenas os pontos que foram criticados na análise.
            O que já foi aprovado permanece igual.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <PhoneProfilePreviewV2 title="Perfil atual" profile={preview.current} />
          <PhoneProfilePreviewV2
            title="Depois das melhorias"
            profile={preview.improved}
          />
        </div>

        {resolvedImprovements.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {resolvedImprovements.map((item) => (
              <ImprovementCardV2 key={item.key} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/80">
              Nenhum ajuste visual crítico foi identificado neste momento. O preview mantém os mesmos elementos porque eles já estão coerentes com a análise.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-2xl flex-col gap-6 pb-12"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
            <Star className="size-7 shrink-0 text-[#C8F135]" />
            Score do Perfil
          </h1>
          <p className="mt-1 text-sm text-[#888]">
            A IA analisa seu perfil e gera diagnóstico completo com sugestões de
            melhoria.
          </p>
        </div>
        <div
          className={`flex shrink-0 flex-col items-center rounded-xl border px-4 py-2 text-center ${
            remainingAnalyses > 0
              ? "border-[#C8F135]/20 bg-[#C8F135]/5"
              : "border-red-500/20 bg-red-500/5"
          }`}
        >
          <p
            className={`text-xl font-bold ${
              remainingAnalyses > 0 ? "text-[#C8F135]" : "text-red-400"
            }`}
          >
            {remainingAnalyses}
          </p>
          <p className="text-[10px] text-[#888]">análises restantes</p>
          <p className="text-[10px] text-[#555]">este mês</p>
        </div>
      </div>

      <Card className="rounded-xl border border-border bg-card">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Print do seu perfil</p>
            {business?.instagram_type === "profissional" && (
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
                Conta profissional - envie 2 prints
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[#888]">
            A análise verifica nome de pesquisa, bio, foto ou logo, link de contato,
            quantidade de posts e, se houver painel profissional, também as métricas.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {imagePreviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {imagePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-xl border border-[#C8F135]/30"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-black">
                    <img
                      src={preview}
                      alt={idx === 0 ? "Bio do Instagram" : "Painel profissional"}
                      className="absolute left-0 top-0 h-auto w-full"
                      style={{ objectPosition: "top center", objectFit: "cover" }}
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">
                    {idx === 0 ? "Bio / Perfil" : "Painel Profissional"}
                  </div>
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 2 &&
                business?.instagram_type === "profissional" && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-400 hover:bg-blue-500/10 transition-all"
                  >
                    <Upload className="size-4" />
                    Adicionar print do painel profissional
                  </button>
                )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#C8F135]/30 bg-[#C8F135]/5 p-10 transition-all hover:border-[#C8F135]/60 hover:bg-[#C8F135]/10"
            >
              <Camera className="size-10 text-[#C8F135]" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">
                  Adicionar print da bio
                </p>
                <p className="mt-1 text-xs text-[#888]">
                  {business?.instagram_type === "profissional"
                    ? "Envie o print da bio E do painel profissional"
                    : "Tire um print do seu perfil no Instagram"}
                </p>
              </div>
            </button>
          )}

          {imagePreviews.length > 0 && (
            <Button
              onClick={analyzeProfile}
              disabled={isAnalyzing || remainingAnalyses <= 0}
              className="w-full gap-2 bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020] disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Analisando seu
                  perfil...
                </>
              ) : remainingAnalyses <= 0 ? (
                <>
                  <Lock className="size-4" /> Limite mensal atingido
                </>
              ) : result ? (
                <>
                  <RefreshCw className="size-4" /> Analisar novamente (
                  {remainingAnalyses} restantes)
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Analisar perfil com IA
                </>
              )}
            </Button>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            className="h-[3px]"
            style={{ background: getScoreColor(getDisplayScore(result)) }}
          />
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative flex size-24 shrink-0 items-center justify-center">
                <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={getScoreColor(getDisplayScore(result))}
                    strokeWidth="8"
                    strokeDasharray={`${getDisplayScore(result) * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold leading-none text-white">
                    {getDisplayScore(result)}
                  </p>
                  <p className="text-[10px] text-[#888]">/100</p>
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#C8F135]">
                  Nota do Perfil
                </p>
                <p className="text-2xl font-bold text-white">{getDisplayGrade(result)}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#888]">
                  {getDisplaySummary(result)}
                </p>
              </div>
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <button
                  onClick={() => setShowOriginalImage(!showOriginalImage)}
                  className="flex items-center gap-2 text-xs text-[#888] transition-colors hover:text-[#C8F135]"
                >
                  <Camera className="size-3.5" />
                  {showOriginalImage
                    ? "Ocultar print original"
                    : "Ver seu print original"}
                  {showOriginalImage ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
                <AnimatePresence>
                  {showOriginalImage && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex flex-wrap gap-2">
                        {imagePreviews.map((preview, idx) => (
                          <img
                            key={idx}
                            src={preview}
                            alt={`Print ${idx + 1}`}
                            className="h-48 rounded-xl border border-border object-cover object-top"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result?.criterios && result.criterios.length > 0 && (
        <Card className="rounded-xl border border-border bg-card">
          <CardContent className="space-y-4 p-4 md:p-6">
            <div>
              <p className="text-sm font-semibold text-white">Critérios analisados</p>
              <p className="mt-1 text-xs text-[#888]">
                Cada ponto abaixo mostra a nota, o que foi avaliado e o que vale ajustar primeiro.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {result.criterios.map((criterio) => (
                <div
                  key={criterio.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{criterio.nome}</p>
                      <p className="text-[11px] uppercase tracking-wider text-[#888]">
                        Peso {criterio.peso}%
                      </p>
                    </div>
                    <div className="rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10 px-2.5 py-1 text-sm font-bold text-[#C8F135]">
                      {criterio.nota.toFixed(1)}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-white/85">
                    {normalizeDisplayText(criterio.feedback)}
                  </p>

                  {criterio.acoes?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {criterio.acoes.slice(0, 2).map((acao, index) => (
                        <div
                          key={`${criterio.id}-${index}`}
                          className="rounded-xl border border-[#C8F135]/15 bg-black/20 p-3 text-xs leading-relaxed text-white/75"
                        >
                          {index + 1}. {normalizeDisplayText(acao)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result && ((result.melhorias_prioritarias?.length || 0) > 0 || (result.pontos_fortes?.length || 0) > 0 || result.proximos_passos) && (
        <Card className="rounded-xl border border-border bg-card">
          <CardContent className="space-y-5 p-4 md:p-6">
            {(result.melhorias_prioritarias?.length || 0) > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">Melhorias prioritárias</p>
                <div className="grid gap-3">
                  {result.melhorias_prioritarias?.map((item) => (
                    <div
                      key={`${item.criterio}-${item.prioridade}`}
                      className="rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#C8F135] px-2 py-0.5 text-[11px] font-bold text-[#111]">
                          Prioridade {item.prioridade}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-[#C8F135]">
                          {normalizeDisplayText(item.impacto)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {normalizeDisplayText(item.criterio.replace(/_/g, " "))}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">
                        {normalizeDisplayText(item.descricao)}
                      </p>
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                          Sugestão concreta
                        </p>
                        <p className="text-xs leading-relaxed text-white/80">
                          {normalizeDisplayText(item.sugestao_concreta)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(result.pontos_fortes?.length || 0) > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">Pontos fortes</p>
                <div className="grid gap-3">
                  {result.pontos_fortes?.map((item, index) => (
                    <div
                      key={`forte-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80"
                    >
                      {normalizeDisplayText(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.proximos_passos && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-sm font-semibold text-white">Próximos passos</p>
                <p className="text-sm leading-relaxed text-white/80">
                  {normalizeDisplayText(result.proximos_passos)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="rounded-xl border border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <InstagramMockupV2
              business={business}
              improvements={result.improvements || []}
              bios={result.bios || []}
              problems={result.problems || []}
            />
          </CardContent>
        </Card>
      )}

      {remainingAnalyses > 0 && imagePreviews.length > 0 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white/5 p-3 text-sm text-[#888] transition-all hover:bg-white/10 hover:text-white"
        >
          <Upload className="size-4" />
          Enviar novo print para comparar evolução ({remainingAnalyses} análises
          restantes)
        </button>
      )}
    </motion.div>
  );
}
