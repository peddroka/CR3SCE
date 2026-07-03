"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import Hash from "lucide-react/dist/esm/icons/hash";
import FileText from "lucide-react/dist/esm/icons/file-text";
import X from "lucide-react/dist/esm/icons/x";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Award from "lucide-react/dist/esm/icons/award";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Video from "lucide-react/dist/esm/icons/video";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import Film from "lucide-react/dist/esm/icons/film";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Mic from "lucide-react/dist/esm/icons/mic";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import Rocket from "lucide-react/dist/esm/icons/rocket";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient, getUserSafely } from "@/lib/supabase/client";
import confetti from "canvas-confetti";

interface Post {
  id?: string;
  time: string;
  content_type: string;
  subtype?: string;
  style_id?: string;
  style_label?: string | null;
  summary?: string;
  connected_to?: string | null;
  cta?: string;
  legenda?: string | null;
  slides?: Array<{
    numero: number;
    tipo: string;
    texto_principal: string;
    texto_secundario?: string;
  }> | null;
  topic: string;
  script: string;
  hashtags: string;
  completed?: boolean;
  visual_prompt?: string;
  is_viral?: boolean;
  platform_tip?: string | null;
}

interface StrategyDay {
  id: string;
  day_number: number;
  posts: Post[];
}

interface Strategy {
  id: string;
  title: string;
  month: number;
  year: number;
  summary: string;
  strategy_days: StrategyDay[];
}

interface StorySection {
  label: string;
  format: string;
  roteiro: string;
  steps: string[];
}

interface InstructionSection {
  title: string;
  steps: string[];
}

interface MonthRef {
  month: number;
  year: number;
}

interface ContentTooltipData {
  titulo: string;
  explicacao: string;
  insight: string;
  cta: string;
}

interface ContentDetailStep {
  numero: number;
  instrucao: string;
  detalhe: string | null;
}

interface ContentDetailNote {
  tipo: string;
  cor: string;
  texto: string;
}

interface ContentDetailData {
  titulo_exibido: string;
  tipo: string;
  roteiro: {
    introducao: string;
    passos: ContentDetailStep[];
    avisos: ContentDetailNote[];
    conexao_proximo: {
      existe: boolean;
      id_conectado: string | null;
      mensagem: string | null;
    };
  };
  guia_visual: {
    introducao: string;
    passos_visuais: ContentDetailStep[];
    ferramentas_sugeridas: string[];
    dicas_visuais: ContentDetailNote[];
  };
  slides?: Array<{
    numero: number;
    tipo: string;
    texto_principal: string;
    texto_secundario?: string;
  }> | null;
}

const contentTypeIcons: Record<string, any> = {
  Reels: Film,
  Carrossel: BookOpen,
  Stories: Video,
  "Post Estatico": ImageIcon,
  Live: Mic,
};

const contentTypeColors: Record<string, string> = {
  Reels: "bg-white/5 border-white/10",
  Carrossel: "bg-white/5 border-white/10",
  Stories: "bg-white/5 border-white/10",
  "Post Estatico": "bg-white/5 border-white/10",
  Live: "bg-white/5 border-white/10",
};

function normalizeText(value: string): string {
  let result = value || "";

  for (let i = 0; i < 2; i++) {
    if (!/[ÃÂâð]/.test(result)) break;

    try {
      result = decodeURIComponent(escape(result));
    } catch {
      break;
    }
  }

  return result.replace(/\uFFFD/g, "");
}

function normalizePost(post: Post): Post {
  return {
    ...post,
    id:
      post.id ||
      `${normalizeText(post.time)}-${normalizeText(post.content_type)}-${normalizeText(post.topic)}`,
    content_type: normalizeText(post.content_type),
    subtype: normalizeText(post.subtype || ""),
    style_id: normalizeText(post.style_id || ""),
    style_label: normalizeText(post.style_label || ""),
    summary: normalizeText(post.summary || ""),
    connected_to: normalizeText(post.connected_to || ""),
    cta: normalizeText(post.cta || ""),
    legenda: normalizeText(post.legenda || ""),
    slides: Array.isArray(post.slides)
      ? post.slides.map((slide) => ({
          numero: slide.numero,
          tipo: normalizeText(slide.tipo || ""),
          texto_principal: normalizeText(slide.texto_principal || ""),
          texto_secundario: normalizeText(slide.texto_secundario || ""),
        }))
      : null,
    topic: normalizeText(post.topic),
    script: normalizeText(post.script),
    hashtags: normalizeText(post.hashtags),
    visual_prompt: normalizeText(post.visual_prompt || ""),
    is_viral: Boolean(post.is_viral),
    platform_tip: normalizeText(post.platform_tip || ""),
  };
}

function normalizeStrategy(strategy: Strategy | null): Strategy | null {
  if (!strategy) return null;

  return {
    ...strategy,
    title: normalizeText(strategy.title),
    summary: normalizeText(strategy.summary),
    strategy_days: strategy.strategy_days.map((day) => ({
      ...day,
      posts: day.posts.map(normalizePost),
    })),
  };
}

function getContentColor(type: string): string {
  for (const [key, val] of Object.entries(contentTypeColors)) {
    if (normalizeContentType(type).includes(normalizeContentType(key))) return val;
  }
  return "bg-white/5 border-white/10";
}

function normalizeContentType(type: string): string {
  return normalizeText(type).toLowerCase();
}

function isReelsType(type: string): boolean {
  return normalizeContentType(type).includes("reels");
}

function isStoriesType(type: string): boolean {
  return normalizeContentType(type).includes("stories");
}

function isCarouselType(type: string): boolean {
  return normalizeContentType(type).includes("carrossel");
}

function isStaticPostType(type: string): boolean {
  return normalizeContentType(type).includes("post estatico");
}

function getContentReason(type: string): string {
  if (isReelsType(type)) {
    return "Reels tem o maior alcance orgânico do Instagram. Mesmo seguidores que não interagem com seus posts veem Reels, o que ajuda a alcançar novos públicos.";
  }

  if (isStoriesType(type)) {
    return "Stories mantêm você presente na mente dos seus seguidores diariamente. Eles fortalecem o relacionamento e geram mais conversas com quem já te acompanha.";
  }

  if (isCarouselType(type)) {
    return "Carrosséis geram mais salvamentos. Quando as pessoas salvam, o algoritmo entende que o conteúdo tem alto valor e tende a ampliar o alcance.";
  }

  if (isStaticPostType(type)) {
    return "Posts estáticos constroem a identidade visual do perfil. Quando alguém visita sua página, a grade de posts ajuda a contar a história da sua marca.";
  }

  return "Lives são priorizadas pelo algoritmo do Instagram e seus seguidores recebem notificação automática. Isso gera confiança por mostrar autenticidade em tempo real.";
}

function getTooltipStyleId(post: Post): string {
  if (post.style_id && post.style_id.trim()) {
    return post.style_id.trim().toUpperCase();
  }

  if (post.subtype && post.subtype.trim()) {
    const normalizedSubtype = normalizeText(post.subtype).toLowerCase();

    if (normalizedSubtype.includes("history_caixinha")) return "H04";
    if (normalizedSubtype.includes("history_enquete")) return "H06";
    if (normalizedSubtype.includes("history_bastidores")) return "H03";
    if (normalizedSubtype.includes("history_dica")) return "H08";
    if (normalizedSubtype.includes("history_bomdiaboatarde")) return "H01";
    if (normalizedSubtype.includes("feed_carrossel")) return "F02";
    if (normalizedSubtype.includes("feed_foto")) return "F05";
    if (normalizedSubtype.includes("reels_educativo")) return "R01";
    if (normalizedSubtype.includes("reels_rapido")) return "R18";
  }

  if (isStoriesType(post.content_type)) return "H08";
  if (isCarouselType(post.content_type)) return "F02";
  if (isStaticPostType(post.content_type)) return "F05";
  if (isReelsType(post.content_type)) {
    return post.is_viral ? "R03" : "R01";
  }

  return "F05";
}

function getDetailPostType(post: Post): string {
  const styleId = getTooltipStyleId(post);

  if (styleId.startsWith("H")) return "HISTORY";
  if (styleId === "F05" || styleId === "F06" || styleId === "F07" || styleId === "F12" || styleId === "F15") {
    return "FEED_FOTO";
  }
  if (styleId.startsWith("F")) return "FEED_CARROSSEL";
  return "REELS";
}

function findConnectedPost(post: Post, posts: Post[]): Post | null {
  if (post.connected_to) {
    return posts.find((candidate) => candidate.id === post.connected_to) || null;
  }

  return posts.find((candidate) => candidate.connected_to === post.id) || null;
}

function getObjectiveLabel(goal?: string | null) {
  const normalized = normalizeText(goal || "").toLowerCase();

  if (normalized === "visualizacao") return "crescer";
  if (normalized === "identidade") return "vender";
  return goal || "crescer";
}

function getPostCacheKey(post: Post) {
  return (
    post.id ||
    `${post.time}-${normalizeText(post.content_type)}-${normalizeText(post.topic)}`
  );
}

function getContentIcon(type: string) {
  for (const [key, Icon] of Object.entries(contentTypeIcons)) {
    if (normalizeContentType(type).includes(normalizeContentType(key))) return Icon;
  }
  return FileText;
}

function calculateStreak(days: StrategyDay[]): number {
  const today = new Date().getDate();
  let streak = 0;

  for (let i = today; i >= 1; i--) {
    const day = days.find((d) => d.day_number === i);
    if (!day) continue;

    const hasCompletedPosts = day.posts?.some((p) => p.completed) || false;
    if (hasCompletedPosts) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Funcao para obter cor do foguete baseado na streak
const getRocketColor = (streak: number) => {
  if (streak >= 2) return "text-primary";
  return "text-muted-foreground";
};

function cleanStoryText(value: string) {
  return normalizeText(value)
    .replace(/^\*+|\*+$/g, "")
    .replace(/^"+|"+$/g, "")
    .trim();
}

function _parseStorySections(script: string): StorySection[] {
  const matches = Array.from(
    script.matchAll(
      /(?:^|\n)(?:\*\*)?(Story\s+\d+)(?:\s*[-:]\s*([^\n*]+))?(?:\*\*)?:?\s*([\s\S]*?)(?=(?:\n(?:\*\*)?Story\s+\d+)|$)/gi,
    ),
  );

  return matches
    .map((match) => {
      const label = cleanStoryText(match[1] || "");
      const legacyFormat = cleanStoryText(match[2] || "");
      const body = (match[3] || "").trim();
      const lines = body
        .split("\n")
        .map((line) => cleanStoryText(line))
        .filter(Boolean);

      let format = legacyFormat;
      let roteiro = "";
      const steps: string[] = [];

      for (const line of lines) {
        if (/^FORMATO:/i.test(line)) {
          format = cleanStoryText(line.replace(/^FORMATO:/i, ""));
          continue;
        }

        if (/^ROTEIRO:/i.test(line)) {
          roteiro = cleanStoryText(line.replace(/^ROTEIRO:/i, ""));
          continue;
        }

        if (/^PASSO A PASSO:/i.test(line)) {
          continue;
        }

        if (/^\d+\./.test(line)) {
          steps.push(cleanStoryText(line.replace(/^\d+\.\s*/, "")));
          continue;
        }

        if (/^Stories com rosto do responsavel/i.test(line)) {
          continue;
        }

        if (!roteiro) {
          roteiro = line;
        }
      }

      return {
        label,
        format,
        roteiro,
        steps,
      };
    })
    .filter(
      (section) =>
        section.label || section.format || section.roteiro || section.steps.length > 0,
    );
}

function parseInstructionSections(
  script: string,
  contentType: string,
): InstructionSection[] {
  let pattern = "";

  if (isStoriesType(contentType)) {
    pattern =
      "(?:Story|STORY)\\s+\\d+(?:[^\\n]*)|(?:Dicas|DICAS)\\s*[—-]\\s*(?:Continuacao|Continuação)(?:[^\\n]*)";
  } else if (isCarouselType(contentType)) {
    pattern = "(?:Slide|SLIDE)\\s+\\d+(?:[^\\n]*)";
  } else if (isReelsType(contentType)) {
    pattern =
      "(?:Cena|CENA)\\s+\\d+(?:[^\\n]*)|(?:CTA FINAL|CTA Final)(?:[^\\n]*)";
  } else {
    return [];
  }

  const matches = Array.from(
    script.matchAll(
      new RegExp(
        `(?:^|\\n)(?:\\*\\*)?(${pattern})(?:\\*\\*)?:?\\s*([\\s\\S]*?)(?=(?:\\n(?:\\*\\*)?(?:${pattern}))|$)`,
        "gi",
      ),
    ),
  );

  return matches
    .map((match) => {
      const title = cleanStoryText(match[1] || "");
      const body = (match[2] || "").trim();
      const lines = body
        .split("\n")
        .map((line) => cleanStoryText(line))
        .filter(Boolean);
      const steps: string[] = [];

      for (const line of lines) {
        if (/^(PASSO A PASSO:|FORMATO:)/i.test(line)) {
          continue;
        }

        if (/^ROTEIRO:/i.test(line)) {
          const roteiro = cleanStoryText(line.replace(/^ROTEIRO:/i, ""));
          if (roteiro) {
            steps.push(`Grave falando: "${roteiro}"`);
          }
          continue;
        }

        if (/^\d+\./.test(line)) {
          steps.push(cleanStoryText(line.replace(/^\d+\.\s*/, "")));
          continue;
        }

        if (/^Stories com rosto do responsavel/i.test(line)) {
          steps.push(line);
          continue;
        }

        steps.push(line);
      }

      return { title, steps };
    })
    .filter((section) => section.title && section.steps.length > 0);
}

function getMonthKey({ month, year }: MonthRef) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function shiftMonth({ month, year }: MonthRef, delta: number): MonthRef {
  const baseDate = new Date(year, month - 1 + delta, 1);
  return {
    month: baseDate.getMonth() + 1,
    year: baseDate.getFullYear(),
  };
}

function getCycleMonths(businessCreatedAt?: string | null): MonthRef[] {
  const today = new Date();

  if (!businessCreatedAt) {
    return [{ month: today.getMonth() + 1, year: today.getFullYear() }];
  }

  const createdAt = new Date(businessCreatedAt);
  if (Number.isNaN(createdAt.getTime())) {
    return [{ month: today.getMonth() + 1, year: today.getFullYear() }];
  }

  const anchorDay = createdAt.getDate();
  const currentMonthRef = {
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  };
  const currentMonthDays = new Date(
    currentMonthRef.year,
    currentMonthRef.month,
    0,
  ).getDate();
  const currentAnchorDay = Math.min(anchorDay, currentMonthDays);
  const currentAnchorDate = new Date(
    currentMonthRef.year,
    currentMonthRef.month - 1,
    currentAnchorDay,
  );

  if (today >= currentAnchorDate) {
    const nextMonthRef = shiftMonth(currentMonthRef, 1);
    return [currentMonthRef, nextMonthRef];
  }

  const previousMonthRef = shiftMonth(currentMonthRef, -1);
  return [previousMonthRef, currentMonthRef];
}

function formatMonthList(months: MonthRef[]) {
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return months
    .map((item) => `${monthNames[item.month - 1]} de ${item.year}`)
    .join(" e ");
}

// Mapeia o tipo de conteúdo do calendário para o formato do Criar Post.
function contentTypeToFormat(
  contentType: string,
): "single" | "carousel" | "reel" {
  const t = (contentType || "").toLowerCase();
  if (t.includes("reel")) return "reel";
  if (t.includes("carrossel") || t.includes("carousel")) return "carousel";
  return "single";
}

// Monta o contexto (observações) a partir dos detalhes que o calendário já tem.
function buildCalendarNotes(post: Post): string {
  const parts = [
    `Publicação planejada no calendário (${post.content_type}${
      post.time ? `, ${post.time}` : ""
    }).`,
  ];
  if (post.script) parts.push(`Roteiro previsto: ${post.script.slice(0, 400)}`);
  if (post.cta) parts.push(`CTA sugerido: ${post.cta}`);
  return parts.join(" ").slice(0, 500);
}

export function StrategyCalendar({
  strategy,
  businessCreatedAt,
  businessNiche,
  businessObjective,
  businessTone,
}: {
  strategy: Strategy | null;
  businessCreatedAt?: string | null;
  businessNiche?: string | null;
  businessObjective?: string | null;
  businessTone?: string | null;
}) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<StrategyDay | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [updatingPost, setUpdatingPost] = useState<string | null>(null);
  const [localStrategy, setLocalStrategy] = useState<Strategy | null>(strategy);
  const [currentMonth, setCurrentMonth] = useState<number>(
    strategy?.month || new Date().getMonth() + 1,
  );
  const [currentYear, setCurrentYear] = useState<number>(
    strategy?.year || new Date().getFullYear(),
  );
  const [loading, setLoading] = useState(false);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [contentTooltipCache, setContentTooltipCache] = useState<
    Record<string, ContentTooltipData>
  >({});
  const [contentDetailCache, setContentDetailCache] = useState<
    Record<string, ContentDetailData>
  >({});
  const [tooltipLoadingKey, setTooltipLoadingKey] = useState<string | null>(null);
  const [contentDetailLoadingKey, setContentDetailLoadingKey] = useState<string | null>(null);
  const [dismissedTooltipKey, setDismissedTooltipKey] = useState<string | null>(null);
  const idleTooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados para accordion
  const [expandedSections, setExpandedSections] = useState({
    titulo: true,
    roteiro: false,
    comoFazer: false,
    guiaVisual: true,
    hashtags: false,
  });
  const [expandedStoryHowTo, setExpandedStoryHowTo] = useState<number | null>(0);

  const [supabase] = useState(() => createClient());
  const allowedMonths = getCycleMonths(businessCreatedAt);
  const allowedMonthKeys = new Set(allowedMonths.map(getMonthKey));
  const focusMessage = `Seu plano está focado em ${formatMonthList(allowedMonths)}. Concentre-se na sua estratégia desses meses por enquanto.`;
  const selectedPostKey = selectedPost ? getPostCacheKey(selectedPost) : null;
  const activeTooltip =
    selectedPostKey && dismissedTooltipKey !== selectedPostKey
      ? contentTooltipCache[selectedPostKey] || null
      : null;
  const activeContentDetail =
    selectedPostKey ? contentDetailCache[selectedPostKey] || null : null;

  const fetchContentTooltip = async (post: Post, cacheKey: string) => {
    if (contentTooltipCache[cacheKey]) {
      return;
    }

    setTooltipLoadingKey(cacheKey);

    try {
      const res = await fetch("/api/content-tooltip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estilo_id: getTooltipStyleId(post),
          titulo_conteudo: post.topic,
          horario: post.time,
          nicho: businessNiche || "",
          objetivo_usuario: getObjectiveLabel(businessObjective),
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | ContentTooltipData
        | { error?: string }
        | null;

      if (!res.ok || !data || "error" in data) {
        throw new Error(
          (data && "error" in data && data.error) ||
            "Não foi possível gerar a explicação agora.",
        );
      }

      if (
        data &&
        "titulo" in data &&
        "explicacao" in data &&
        "insight" in data &&
        "cta" in data
      ) {
        setContentTooltipCache((prev) => ({
          ...prev,
          [cacheKey]: data as ContentTooltipData,
        }));
      }
    } catch (error) {
      console.error("Erro ao gerar tooltip estrategico:", error);
    } finally {
      setTooltipLoadingKey((prev) => (prev === cacheKey ? null : prev));
    }
  };

  const fetchContentDetail = async (
    post: Post,
    day: StrategyDay,
    cacheKey: string,
  ) => {
    if (contentDetailCache[cacheKey]) {
      return;
    }

    setContentDetailLoadingKey(cacheKey);

    try {
      const connectedPost = findConnectedPost(post, day.posts);
      const res = await fetch("/api/content-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_publicacao: post.id || cacheKey,
          estilo_id: getTooltipStyleId(post),
          titulo: post.topic,
          tipo: getDetailPostType(post),
          nicho: businessNiche || "",
          tom_de_voz: businessTone || "",
          objetivo_usuario: getObjectiveLabel(businessObjective),
          conectado_com: connectedPost?.id || null,
          horario: post.time,
          horario_conectado: connectedPost?.time || null,
          titulo_conectado: connectedPost?.topic || null,
          script: post.script,
          legenda: post.legenda || null,
          slides: post.slides || null,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | ContentDetailData
        | { error?: string }
        | null;

      if (!res.ok || !data || "error" in data) {
        throw new Error(
          (data && "error" in data && data.error) ||
            "Não foi possível montar os detalhes deste conteúdo.",
        );
      }

      if (
        data &&
        "titulo_exibido" in data &&
        "tipo" in data &&
        "roteiro" in data &&
        "guia_visual" in data
      ) {
        setContentDetailCache((prev) => ({
          ...prev,
          [cacheKey]: data as ContentDetailData,
        }));
      }
    } catch (error) {
      console.error("Erro ao gerar detalhe do conteúdo:", error);
    } finally {
      setContentDetailLoadingKey((prev) => (prev === cacheKey ? null : prev));
    }
  };

  useEffect(() => {
    setLocalStrategy(normalizeStrategy(strategy));
  }, [strategy]);

  useEffect(() => {
    if (!selectedPostKey) {
      setDismissedTooltipKey(null);
      return;
    }

    setDismissedTooltipKey(null);
  }, [selectedPostKey]);

  useEffect(() => {
    if (!selectedPost || !selectedPostKey) {
      if (idleTooltipTimerRef.current) {
        clearTimeout(idleTooltipTimerRef.current);
        idleTooltipTimerRef.current = null;
      }
      return;
    }

    if (contentTooltipCache[selectedPostKey] || dismissedTooltipKey === selectedPostKey) {
      return;
    }

    const scheduleTooltip = () => {
      if (idleTooltipTimerRef.current) {
        clearTimeout(idleTooltipTimerRef.current);
      }

      idleTooltipTimerRef.current = setTimeout(() => {
        void fetchContentTooltip(selectedPost, selectedPostKey);
      }, 25000);
    };

    const handleActivity = () => {
      if (contentTooltipCache[selectedPostKey] || dismissedTooltipKey === selectedPostKey) {
        return;
      }

      scheduleTooltip();
    };

    scheduleTooltip();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("scroll", handleActivity, true);

    return () => {
      if (idleTooltipTimerRef.current) {
        clearTimeout(idleTooltipTimerRef.current);
        idleTooltipTimerRef.current = null;
      }

      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity, true);
    };
  }, [
    businessNiche,
    businessObjective,
    contentTooltipCache,
    dismissedTooltipKey,
    selectedPost,
    selectedPostKey,
  ]);

  useEffect(() => {
    if (!selectedPost || !selectedPostKey || !selectedDay) {
      return;
    }

    if (contentDetailCache[selectedPostKey]) {
      return;
    }

    void fetchContentDetail(selectedPost, selectedDay, selectedPostKey);
  }, [
    businessNiche,
    businessObjective,
    businessTone,
    contentDetailCache,
    selectedDay,
    selectedPost,
    selectedPostKey,
  ]);

  const loadMonthStrategy = async (force = false) => {
    if (
      !force &&
      localStrategy?.month === currentMonth &&
      localStrategy?.year === currentYear
    ) {
      return;
    }

    setLoading(true);
    try {
      const { user } = await getUserSafely(supabase);

      if (!user) {
        setCalendarError("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }

      const { data: strategies } = await supabase
        .from("strategies")
        .select(
          `
            id,
            title,
            month,
            year,
            summary,
            strategy_days (
              id,
              day_number,
              posts
            )
          `,
        )
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (strategies && strategies.length > 0) {
        setCalendarError(null);
        setLocalStrategy(normalizeStrategy(strategies[0] as Strategy));
      } else {
        setLocalStrategy(null);
      }
    } catch (error) {
      console.error("Erro ao carregar estratégia:", error);
      setCalendarError("Não foi possível carregar sua estratégia agora.");
    } finally {
      setLoading(false);
    }
  };

  // Carregar estrategia do mes selecionado
  useEffect(() => {
    void loadMonthStrategy();
  }, [currentMonth, currentYear]);

  const handleGenerateStrategy = async () => {
    setGeneratingStrategy(true);
    setCalendarError(null);

    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonth,
          year: currentYear,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        throw new Error(data?.error || "Não foi possível gerar a estratégia.");
      }

      await loadMonthStrategy(true);
    } catch (error) {
      console.error("Erro ao gerar estratégia:", error);
      setCalendarError(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a estratégia agora.",
      );
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const changeMonth = (direction: -1 | 1) => {
    const targetMonthRef = shiftMonth(
      { month: currentMonth, year: currentYear },
      direction,
    );

    if (!allowedMonthKeys.has(getMonthKey(targetMonthRef))) {
      setCalendarError(focusMessage);
      return;
    }

    setSelectedDay(null);
    setSelectedPost(null);
    setCalendarError(null);
    setLocalStrategy(null);

    setCurrentMonth(targetMonthRef.month);
    setCurrentYear(targetMonthRef.year);
  };

  const handleToggleComplete = async (post: Post, dayId: string) => {
    const postKey =
      post.id ||
      `${post.time}-${normalizeText(post.content_type)}-${normalizeText(post.topic)}`;
    setUpdatingPost(postKey);

    try {
      const newCompletedState = !post.completed;

      const { data: currentDay, error: fetchError } = await supabase
        .from("strategy_days")
        .select("posts")
        .eq("id", dayId)
        .single();

      if (fetchError) throw fetchError;

      const dbPosts: any[] = Array.isArray(currentDay.posts)
        ? [...currentDay.posts]
        : [];

      const postIndex = dbPosts.findIndex(
        (p: any) =>
          (post.id && p.id === post.id) ||
          (!post.id &&
            p.time === post.time &&
            normalizeText(p.content_type) === normalizeText(post.content_type)),
      );

      if (postIndex === -1) {
        console.error("Post não encontrado:", post.time, post.content_type);
        console.log(
          "Posts no banco:",
          dbPosts.map((p) => `${p.time}-${p.content_type}`),
        );
        return;
      }

      const updatedPosts = dbPosts.map((p: any, idx: number) =>
        idx === postIndex ? { ...p, completed: newCompletedState } : p,
      );

      const { error: updateError } = await supabase
        .from("strategy_days")
        .update({ posts: updatedPosts })
        .eq("id", dayId);

      if (updateError) throw updateError;

      console.log("Salvo - dayId:", dayId, "postIndex:", postIndex, "key:", postKey);

      setLocalStrategy((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          strategy_days: prev.strategy_days.map((day) => {
            if (day.id !== dayId) return day;
            return {
              ...day,
              posts: day.posts.map((p, idx) =>
                idx === postIndex ? { ...p, completed: newCompletedState } : p,
              ),
            };
          }),
        };
      });

      setSelectedDay((prev) => {
        if (!prev || prev.id !== dayId) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p, idx) =>
            idx === postIndex ? { ...p, completed: newCompletedState } : p,
          ),
        };
      });

      setSelectedPost((prev) => {
        if (!prev) return prev;
        const prevKey =
          prev.id ||
          `${prev.time}-${normalizeText(prev.content_type)}-${normalizeText(prev.topic)}`;
        if (prevKey === postKey) {
          return { ...prev, completed: newCompletedState };
        }
        return prev;
      });

      if (newCompletedState) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#C8F135", "#ffffff", "#a8d020"],
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    } finally {
      setUpdatingPost(null);
    }
  };

  const getInstagramUrl = (post: Post) => {
    const firstHashtag = post.hashtags
      .split(/\s+/)
      .find((tag) => tag.trim().startsWith("#"))
      ?.replace("#", "");
    const fallback = post.topic.replace(/\s+/g, "");
    return `https://www.instagram.com/explore/tags/${encodeURIComponent(firstHashtag || fallback)}/`;
  };

  const getTikTokUrl = (post: Post) => {
    const query = `${post.topic} ${post.content_type}`.trim();
    return `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
  };

  const handleSeeExamples = (post: Post) => {
    window.open(getInstagramUrl(post), "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!localStrategy) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-3"
      >
        <Card className="w-full max-w-2xl border-2 border-primary/20 bg-card rounded-2xl">
          <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
            <motion.div
              className="flex size-24 items-center justify-center rounded-full bg-primary/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <CalendarDays className="size-12 text-primary" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Nenhuma estratégia para {currentMonth}/{currentYear}
              </h2>
              <p className="text-lg text-muted-foreground">
                Gere agora o calendário deste mês para continuar.
              </p>
            </div>

            {calendarError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {calendarError}
              </div>
            )}

            <Button
              onClick={() => void handleGenerateStrategy()}
              disabled={generatingStrategy}
              className="gap-2 rounded-xl bg-primary px-6 py-5 hover:bg-primary/90"
            >
              {generatingStrategy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Sparkles className="size-5" />
              )}
              {generatingStrategy ? "Gerando estratégia..." : "Gerar estratégia"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const strategyDays = localStrategy?.strategy_days || [];
  const sortedDays = [...strategyDays].sort(
    (a, b) => a.day_number - b.day_number,
  );

  // Calcular progresso
  let totalPosts = 0;
  let completedPosts = 0;

  sortedDays.forEach((day) => {
    if (day.posts && Array.isArray(day.posts)) {
      totalPosts += day.posts.length;
      completedPosts += day.posts.filter((p) => p.completed).length;
    }
  });

  const completionPercentage =
    totalPosts > 0 ? (completedPosts / totalPosts) * 100 : 0;
  const streak = calculateStreak(sortedDays);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const isStructuredContent = Boolean(
    selectedPost &&
      (isStoriesType(selectedPost.content_type) ||
        isCarouselType(selectedPost.content_type) ||
        isReelsType(selectedPost.content_type)),
  );
  const instructionSections =
    selectedPost && isStructuredContent
      ? parseInstructionSections(selectedPost.script, selectedPost.content_type)
      : [];
  const detailSlides =
    activeContentDetail?.slides && activeContentDetail.slides.length > 0
      ? activeContentDetail.slides
      : selectedPost?.slides && selectedPost.slides.length > 0
        ? selectedPost.slides
        : [];

  const dayMap = new Map<number, StrategyDay>();
  sortedDays.forEach((d) => dayMap.set(d.day_number, d));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 pb-12"
    >
      {/* Header com navegacao e streak */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeMonth(-1)}
            className="size-9 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold">
            <CalendarDays className="size-6 md:size-8 text-primary" />
            <span className="font-bold text-white">
              {monthNames[currentMonth - 1]}{" "}
              <span className="text-[#C8F135]">{currentYear}</span>
            </span>
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeMonth(1)}
            className="size-9 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Streak e Progresso em linha */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Streak com foguete */}
          <div
            id="streak-indicator"
            className="flex items-center gap-2 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-full px-4 py-2"
          >
            <Rocket className={cn("size-5", getRocketColor(streak))} />
            <span className="font-bold text-sm text-yellow-500">{streak}</span>
            <span className="text-xs text-muted-foreground">dias</span>
          </div>

          {/* Progresso */}
          <Card className="rounded-xl border border-border bg-card">
            <CardContent className="py-2 px-4 flex items-center gap-3">
              <Award className="size-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Progresso</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-[#C8F135]">
                    {completedPosts}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {totalPosts}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </motion.div>

      {calendarError && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
          {calendarError}
        </div>
      )}

      {/* Barra de progresso */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border border-primary/10 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#C8F135]" />
                Progresso do mês
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Legenda */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {["Reels", "Carrossel", "Stories", "Post Estatico", "Live"].map(
          (type) => {
            const Icon = contentTypeIcons[type] || FileText;
            return (
              <Badge
                key={type}
                variant="outline"
                className="flex items-center gap-1 text-xs border-primary/20 rounded-full py-1 px-3"
              >
                <Icon className="size-3 text-primary" />
                {type}
              </Badge>
            );
          },
        )}
      </motion.div>

      {/* Calendario Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-primary/20 bg-card rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Dias vazios do inicio do mes */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square rounded-lg bg-transparent"
                />
              ))}

              {/* Dias do mes */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const dayData = dayMap.get(dayNum);
                const hasPosts = dayData?.posts && dayData.posts.length > 0;

                if (!hasPosts) {
                  return (
                    <div
                      key={dayNum}
                      className="aspect-square rounded-lg bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/20 flex items-center justify-center"
                    >
                      <span className="text-xs text-muted-foreground/30">
                        {dayNum}
                      </span>
                    </div>
                  );
                }

                const sortedPosts = [...dayData.posts].sort((a, b) => {
                  const timeA = a.time.replace(":", "").padStart(4, "0");
                  const timeB = b.time.replace(":", "").padStart(4, "0");
                  return timeA.localeCompare(timeB);
                });

                const completedCount = sortedPosts.filter(
                  (p) => p.completed,
                ).length;
                const totalCount = sortedPosts.length;
                const fillPercent =
                  totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                const isComplete = completedCount === totalCount;
                const isPartial =
                  completedCount > 0 && completedCount < totalCount;

                return (
                  <motion.button
                    key={dayNum}
                    onClick={() => setSelectedDay({ ...dayData, posts: sortedPosts })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all",
                      isComplete &&
                        "border-[#C8F135] shadow-[0_0_10px_rgba(200,241,53,0.35)]",
                      isPartial && "border-[#C8F135]/40",
                      !isComplete &&
                        !isPartial &&
                        "border-white/15 bg-white/5 hover:border-white/30",
                    )}
                    title={
                      isComplete
                        ? `Dia ${dayNum}: todo o conteúdo concluído (${completedCount}/${totalCount})`
                        : `Dia ${dayNum}: ${completedCount} de ${totalCount} conteúdos concluídos`
                    }
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-700"
                      style={{
                        height: `${fillPercent}%`,
                        backgroundColor: isComplete
                          ? "#C8F135"
                          : "rgba(200,241,53,0.25)",
                      }}
                    />

                    <span
                      className="relative z-10 font-bold text-xs leading-none"
                      style={{
                        color: isComplete
                          ? "#111"
                          : fillPercent >= 60
                            ? "#111"
                            : "rgba(255,255,255,0.8)",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {dayNum}
                    </span>

                    {isComplete ? (
                      <CheckCircle2
                        className="relative z-10 mt-0.5 size-3.5 shrink-0"
                        style={{ color: "#111" }}
                        aria-label="Conteúdo do dia concluído"
                      />
                    ) : (
                      <span
                        className="relative z-10 mt-0.5 text-[9px] font-semibold leading-none"
                        style={{
                          color:
                            fillPercent >= 60
                              ? "rgba(17,17,17,0.75)"
                              : isPartial
                                ? "#C8F135"
                                : "rgba(255,255,255,0.45)",
                        }}
                      >
                        {completedCount}/{totalCount}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legenda de conclusão */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-sm bg-[#C8F135]">
                  <CheckCircle2 className="size-3 text-[#111]" />
                </span>
                Dia concluído
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-4 rounded-sm border border-[#C8F135]/50 bg-[rgba(200,241,53,0.25)]" />
                Parcial (ex.: 1/3)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-4 rounded-sm border border-white/20 bg-white/5" />
                Pendente
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal do Dia */}
      <AnimatePresence>
        {selectedDay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border-2 border-primary/20 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Dia <span className="text-[#C8F135]">{selectedDay.day_number}</span>
                  <span className="ml-3 text-sm font-normal text-[#666]">
                    {monthNames[currentMonth - 1]} {currentYear}
                  </span>
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDay(null)}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {selectedDay.posts.map((post, index) => {
                  const Icon = getContentIcon(post.content_type);
                  const isViralReels = isReelsType(post.content_type) && post.is_viral;

                  return (
                    <motion.div
                      key={post.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        post.completed
                          ? "border-green-500 bg-green-500/10"
                          : isViralReels
                            ? "border-red-500/60 bg-red-500/10 hover:border-red-400"
                          : "border-primary/30 bg-primary/5 hover:border-primary hover:shadow-lg",
                      )}
                      onClick={() => {
                        setSelectedPost(post);
                        setExpandedStoryHowTo(0);
                        // Reset accordion quando abrir novo post
                        setExpandedSections({
                          titulo: true,
                          comoFazer: true,
                          roteiro: false,
                          guiaVisual: true,
                          hashtags: false,
                        });
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-xl",
                            post.completed
                              ? "bg-green-500/20"
                              : "bg-primary/20",
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-5",
                              post.completed
                                ? "text-green-600"
                                : "text-primary",
                            )}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold text-lg">
                              {post.time}
                            </span>
                            <Badge
                              className={cn(
                                "border rounded-full px-3",
                                getContentColor(post.content_type),
                              )}
                            >
                              {isViralReels ? "Reels Viral" : post.content_type}
                            </Badge>
                            {isViralReels && (
                              <Badge className="rounded-full border border-red-500/30 bg-red-500 text-white">
                                🔥 REELS VIRAL
                              </Badge>
                            )}
                            {post.completed && (
                              <Badge className="bg-green-500 rounded-full px-3">
                                Concluído
                              </Badge>
                            )}
                          </div>

                          <p className="text-lg font-medium mb-1">
                            {post.topic}
                          </p>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.script.substring(0, 100)}...
                          </p>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              try {
                                window.sessionStorage.setItem(
                                  "cr3sce_post_seed",
                                  JSON.stringify({
                                    topic: post.topic,
                                    format: contentTypeToFormat(
                                      post.content_type,
                                    ),
                                    notes: buildCalendarNotes(post),
                                    auto: true,
                                  }),
                                );
                              } catch {}
                              router.push("/dashboard/criar-post");
                            }}
                            className="mt-3 gap-1.5 rounded-full border-[#C8F135]/40 bg-[#C8F135]/10 text-xs font-semibold text-[#C8F135] hover:bg-[#C8F135]/20 hover:text-[#C8F135]"
                          >
                            <Sparkles className="size-3.5" />
                            Gerar publicação
                          </Button>
                        </div>

                        <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal do Post - COM ACCORDION */}
      <AnimatePresence>
        {selectedPost && selectedDay && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl border-2",
                selectedPost.is_viral && isReelsType(selectedPost.content_type)
                  ? "border-red-500 bg-red-500/10"
                  : "border-primary/20",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-primary">
                      {selectedPost.time}
                    </h3>
                    <Badge
                      className={cn(
                        "border rounded-full px-4 py-1",
                        getContentColor(selectedPost.content_type),
                      )}
                    >
                      {selectedPost.is_viral && isReelsType(selectedPost.content_type)
                        ? "Reels Viral"
                        : selectedPost.content_type}
                    </Badge>
                    {selectedPost.is_viral && isReelsType(selectedPost.content_type) && (
                      <Badge className="rounded-full border border-red-500/30 bg-red-500 text-white">
                        🔥 REELS VIRAL
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dia {selectedDay.day_number} - {selectedDay.day_number} de{" "}
                    {monthNames[currentMonth - 1]}
                  </p>
                  {selectedPost.is_viral && isReelsType(selectedPost.content_type) && (
                    <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      Este conteúdo foi especialmente criado para viralizar.
                      Invista mais tempo na produção.
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Titulo do Conteudo - Accordion */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("titulo")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 transition-colors"
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      Título do Conteúdo
                    </span>
                    {expandedSections.titulo ? (
                      <ChevronUp className="size-4 text-primary" />
                    ) : (
                      <ChevronDown className="size-4 text-primary" />
                    )}
                  </button>
                  {expandedSections.titulo && (
                    <div className="border-t border-border bg-card p-4">
                      <p className="text-base font-medium text-white">
                        {(activeContentDetail?.titulo_exibido || selectedPost.topic).endsWith(".")
                          ? activeContentDetail?.titulo_exibido || selectedPost.topic
                          : `${activeContentDetail?.titulo_exibido || selectedPost.topic}.`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Como fazer este conteudo - Accordion */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("comoFazer")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 transition-colors"
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Video className="size-4 text-primary" />
                      Como fazer este conteúdo
                    </span>
                    {expandedSections.comoFazer ? (
                      <ChevronUp className="size-4 text-primary" />
                    ) : (
                      <ChevronDown className="size-4 text-primary" />
                    )}
                  </button>
                  {expandedSections.comoFazer && (
                    <div className="p-4 bg-card border-t border-primary/10 space-y-3">
                      {contentDetailLoadingKey === selectedPostKey && !activeContentDetail && (
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                          <Loader2 className="size-4 animate-spin text-[#C8F135]" />
                          Montando o roteiro completo e o guia visual deste conteúdo...
                        </div>
                      )}
                      {activeContentDetail ? (
                        <div className="space-y-4">
                          <p className="text-sm leading-relaxed text-white/85">
                            {activeContentDetail.roteiro.introducao}
                          </p>

                          <div className="space-y-3">
                            {activeContentDetail.roteiro.passos.map((passo) => (
                              <div
                                key={`${passo.numero}-${passo.instrucao}`}
                                className="rounded-2xl border border-[#C8F135]/15 bg-white/5 p-4"
                              >
                                <div className="flex gap-3">
                                  <span className="shrink-0 font-bold text-[#C8F135]">
                                    {passo.numero}.
                                  </span>
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-white">
                                      {passo.instrucao}
                                    </p>
                                    {passo.detalhe && (
                                      <p className="whitespace-pre-line text-sm leading-relaxed text-[#d1d5db]">
                                        {passo.detalhe}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {detailSlides.length > 0 && (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-sm font-medium text-white">
                                Estrutura dos slides
                              </p>
                              <div className="mt-3 space-y-3">
                                {detailSlides.map((slide) => (
                                  <div
                                    key={`${slide.numero}-${slide.tipo}`}
                                    className="rounded-xl border border-white/10 bg-black/20 p-3"
                                  >
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#C8F135]">
                                      Slide {slide.numero} • {slide.tipo}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-white">
                                      {slide.texto_principal}
                                    </p>
                                    {slide.texto_secundario && (
                                      <p className="mt-1 text-sm text-[#d1d5db]">
                                        {slide.texto_secundario}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeContentDetail.roteiro.avisos.length > 0 && (
                            <div className="space-y-3">
                              {activeContentDetail.roteiro.avisos.map((item, index) => (
                                <div
                                  key={`${item.tipo}-${index}`}
                                  className={cn(
                                    "rounded-2xl border p-4",
                                    item.cor === "vermelho"
                                      ? "border-red-500/20 bg-red-500/10"
                                      : "border-green-500/20 bg-green-500/10",
                                  )}
                                >
                                  <p
                                    className={cn(
                                      "text-sm font-medium",
                                      item.cor === "vermelho"
                                        ? "text-red-100"
                                        : "text-green-100",
                                    )}
                                  >
                                    {item.texto}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {activeContentDetail.roteiro.conexao_proximo.existe &&
                            activeContentDetail.roteiro.conexao_proximo.mensagem && (
                              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                                <p className="text-sm font-medium text-blue-100">
                                  {activeContentDetail.roteiro.conexao_proximo.mensagem}
                                </p>
                              </div>
                            )}
                        </div>
                      ) : (
                        <>
                      {isStructuredContent && instructionSections.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-white">
                            Toque em cada etapa para ver o passo a passo:
                          </p>
                          <div className="space-y-3">
                            {instructionSections.map((section, index) => {
                              const isOpen = expandedStoryHowTo === index;

                              return (
                                <div
                                  key={`${section.title}-howto`}
                                  className="overflow-hidden rounded-2xl border border-[#C8F135]/15 bg-white/5"
                                >
                                  <button
                                    onClick={() =>
                                      setExpandedStoryHowTo((prev) =>
                                        prev === index ? null : index,
                                      )
                                    }
                                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="size-2.5 shrink-0 rounded-full bg-[#C8F135]" />
                                      <div>
                                        <p className="text-sm font-semibold text-white">
                                          {section.title}
                                        </p>
                                      </div>
                                    </div>
                                    {isOpen ? (
                                      <ChevronUp className="size-4 text-[#C8F135]" />
                                    ) : (
                                      <ChevronDown className="size-4 text-[#C8F135]" />
                                    )}
                                  </button>

                                  {isOpen && (
                                    <div className="space-y-4 border-t border-[#C8F135]/10 px-4 py-4">
                                      {section.steps.length > 0 ? (
                                        <ol className="space-y-3 text-sm text-[#d1d5db]">
                                          {section.steps.map((step, stepIndex) => (
                                            <li key={stepIndex} className="flex gap-3">
                                              <span className="shrink-0 font-bold text-[#C8F135]">
                                                {stepIndex + 1}.
                                              </span>
                                              <span>{step}</span>
                                            </li>
                                          ))}
                                        </ol>
                                      ) : (
                                        <p className="text-sm leading-relaxed text-[#d1d5db]">
                                          Grave um vídeo vertical mostrando seu rosto
                                          e siga este formato com linguagem simples.
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                      {selectedPost.content_type === "Stories" &&
                        instructionSections.length === 0 && (
                          <>
                            <p className="text-sm font-medium text-white">
                              Como gravar esta sequência de Stories:
                            </p>
                            <ol className="space-y-2 text-sm text-[#c0c0c0]">
                              <li className="flex gap-2">
                                <span className="shrink-0 font-bold text-[#C8F135]">1.</span>
                                Story 1: abra o Instagram, entre na câmera de Stories e lance uma enquete ou caixinha em vídeo, mostrando seu rosto
                              </li>
                              <li className="flex gap-2">
                                <span className="shrink-0 font-bold text-[#C8F135]">2.</span>
                                Story 2: grave um vídeo curto avisando que vai responder no próximo story
                              </li>
                              <li className="flex gap-2">
                                <span className="shrink-0 font-bold text-[#C8F135]">3.</span>
                                Story 3: responda a primeira pergunta recebida de forma direta, detalhada e com exemplo real
                              </li>
                              <li className="flex gap-2">
                                <span className="shrink-0 font-bold text-[#C8F135]">4.</span>
                                Dicas — continuação: continue respondendo as perguntas seguintes, uma por uma, sem roteiro fixo
                              </li>
                            </ol>
                            <p className="text-xs text-[#666]">
                              Se ninguém responder, você mesmo pode fazer a pergunta e responder. Isso gera conteúdo real e não há nada de errado nisso.
                            </p>
                          </>
                        )}
                      {selectedPost.content_type === "Reels" &&
                        instructionSections.length === 0 && (
                        <>
                          <p className="text-sm font-medium text-white">
                            Como gravar este Reels:
                          </p>
                          <ol className="space-y-2 text-sm text-[#c0c0c0]">
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">1.</span>
                              Abra a câmera e grave na vertical
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">2.</span>
                              Nos 3 primeiros segundos, fale o gancho principal
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">3.</span>
                              Desenvolva o conteúdo com o roteiro embutido no passo a passo
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">4.</span>
                              Feche o vídeo com a chamada para ação final
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">5.</span>
                              Edite com cortes rápidos, adicione legenda e escolha uma música popular no momento em que você está gravando
                            </li>
                          </ol>
                        </>
                      )}
                      {selectedPost.content_type === "Carrossel" &&
                        instructionSections.length === 0 && (
                        <>
                          <p className="text-sm font-medium text-white">
                            Como montar este Carrossel:
                          </p>
                          <ol className="space-y-2 text-sm text-[#c0c0c0]">
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">1.</span>
                              Slide 1: crie a capa no Canva com título principal, subtítulo menor e a frase "Passe para o lado" no rodapé
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">2.</span>
                              Slide 2: desenvolva o conteúdo em etapas simples e diretas, sem excesso de texto
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">3.</span>
                              Slide 3: feche com uma chamada para ação curta e clara
                            </li>
                          </ol>
                        </>
                      )}
                      {selectedPost.content_type === "Post Estatico" && (
                        <>
                          <p className="text-sm font-medium text-white">
                            Como criar este Post Estático:
                          </p>
                          <ol className="space-y-2 text-sm text-[#c0c0c0]">
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">1.</span>
                              Crie a imagem no Canva mantendo a identidade visual da sua marca
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">2.</span>
                              Use o tópico do roteiro como título visual da imagem
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">3.</span>
                              Texto sobreposto: máximo 20% da imagem
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">4.</span>
                              Copie a legenda do roteiro acima e cole no Instagram
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">5.</span>
                              Adicione as hashtags listadas e publique
                            </li>
                          </ol>
                          <p className="text-xs text-[#666]">
                            Dica: imagens com rosto humano geram até 38% mais engajamento.
                          </p>
                        </>
                      )}
                      {selectedPost.content_type === "Live" && (
                        <>
                          <p className="text-sm font-medium text-white">
                            Como conduzir esta Live:
                          </p>
                          <ol className="space-y-2 text-sm text-[#c0c0c0]">
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">1.</span>
                              Avise nos Stories com 24h de antecedência usando o sticker de contagem regressiva
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">2.</span>
                              Prepare os tópicos do roteiro acima como pauta
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">3.</span>
                              Abertura: boas-vindas e apresente o tema da live
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">4.</span>
                              Desenvolvimento: siga a pauta do roteiro interagindo com comentários
                            </li>
                            <li className="flex gap-2">
                              <span className="shrink-0 font-bold text-[#C8F135]">5.</span>
                              Encerramento: agradeça e mencione o próximo conteúdo
                            </li>
                          </ol>
                          <p className="text-xs text-[#666]">
                            Dica: lives com mais de 20 minutos são priorizadas pelo algoritmo do Instagram.
                          </p>
                        </>
                      )}
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-medium text-white">
                          Como criar o visual desse post
                        </p>
                        <div className="mt-3 space-y-3 text-sm text-[#d1d5db]">
                          <p>
                            Para criar o visual desse post, use uma dessas ferramentas:
                          </p>
                          <ol className="space-y-3">
                            <li className="flex gap-3">
                              <span className="shrink-0 font-bold text-[#C8F135]">1.</span>
                              <span>
                                Canva (canva.com) — gratuito e fácil. Escolha um template de Story ou feed, substitua o texto pelo roteiro acima e ajuste as cores da sua marca.
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="shrink-0 font-bold text-[#C8F135]">2.</span>
                              <span>
                                Adobe Express (express.adobe.com) — alternativa profissional com templates prontos para Instagram e TikTok.
                              </span>
                            </li>
                          </ol>
                          <p>
                            Dica: mantenha sempre a mesma paleta de cores e fonte em todos os posts. Isso cria identidade visual e faz o perfil parecer profissional.
                          </p>
                        </div>
                      </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {activeContentDetail && (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("guiaVisual")}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 transition-colors"
                    >
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <ImageIcon className="size-4 text-primary" />
                        Guia visual
                      </span>
                      {expandedSections.guiaVisual ? (
                        <ChevronUp className="size-4 text-primary" />
                      ) : (
                        <ChevronDown className="size-4 text-primary" />
                      )}
                    </button>
                    {expandedSections.guiaVisual && (
                      <div className="space-y-4 border-t border-border bg-card p-4">
                        <p className="text-sm leading-relaxed text-white/85">
                          {activeContentDetail.guia_visual.introducao}
                        </p>

                        <div className="space-y-3">
                          {activeContentDetail.guia_visual.passos_visuais.map((passo) => (
                            <div
                              key={`${passo.numero}-${passo.instrucao}`}
                              className="rounded-2xl border border-white/10 bg-white/5 p-4"
                            >
                              <div className="flex gap-3">
                                <span className="shrink-0 font-bold text-[#C8F135]">
                                  {passo.numero}.
                                </span>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-white">
                                    {passo.instrucao}
                                  </p>
                                  {passo.detalhe && (
                                    <p className="whitespace-pre-line text-sm leading-relaxed text-[#d1d5db]">
                                      {passo.detalhe}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#C8F135]">
                            Ferramentas sugeridas
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activeContentDetail.guia_visual.ferramentas_sugeridas.map((tool) => (
                              <Badge
                                key={tool}
                                variant="secondary"
                                className="rounded-full bg-white/10 px-3 py-1 text-sm text-white"
                              >
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {activeContentDetail.guia_visual.dicas_visuais.length > 0 && (
                          <div className="space-y-3">
                            {activeContentDetail.guia_visual.dicas_visuais.map((item, index) => (
                              <div
                                key={`${item.tipo}-${index}`}
                                className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4"
                              >
                                <p className="text-sm font-medium text-green-100">
                                  {item.texto}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!isStructuredContent && !activeContentDetail && (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("roteiro")}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 transition-colors"
                    >
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        Roteiro Detalhado
                      </span>
                      {expandedSections.roteiro ? (
                        <ChevronUp className="size-4 text-primary" />
                      ) : (
                        <ChevronDown className="size-4 text-primary" />
                      )}
                    </button>
                    {expandedSections.roteiro && (
                      <div className="border-t border-border bg-card p-4">
                        <div className="flex flex-col gap-4">
                          {selectedPost.script
                            .split(/\n(?=\d+\.|PASSO|Step|\n)/)
                            .filter((part) => part.trim())
                            .map((part, i) => (
                              <div
                                key={i}
                                className="text-sm leading-relaxed text-[#c0c0c0]"
                              >
                                {part.trim()}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hashtags - Accordion */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("hashtags")}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 transition-colors"
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Hash className="size-4 text-primary" />
                      Hashtags
                    </span>
                    {expandedSections.hashtags ? (
                      <ChevronUp className="size-4 text-primary" />
                    ) : (
                      <ChevronDown className="size-4 text-primary" />
                    )}
                  </button>
                  {expandedSections.hashtags && (
                    <div className="p-4 bg-card border-t border-primary/10">
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.hashtags.split(/\s+/).map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-sm bg-primary/10 text-white hover:bg-primary/20 cursor-pointer rounded-full px-3 py-1"
                            onClick={() =>
                              window.open(
                                `https://www.instagram.com/explore/tags/${tag.replace("#", "")}`,
                                "_blank",
                              )
                            }
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="size-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">
                      Por que postar este conteúdo?
                    </span>
                  </div>
                  <p className="text-sm text-white">
                    {getContentReason(selectedPost.content_type)}
                  </p>
                </div>

                <AnimatePresence>
                  {(activeTooltip || tooltipLoadingKey === selectedPostKey) && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="rounded-2xl border border-[#C8F135]/20 bg-gradient-to-br from-[#C8F135]/10 to-white/5 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#C8F135]">
                            {activeTooltip?.titulo || "Por que esse conteúdo funciona?"}
                          </p>
                          <p className="mt-1 text-xs text-[#94a3b8]">
                            Insight automático depois de 25 segundos parado neste item.
                          </p>
                        </div>
                        {activeTooltip && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (selectedPostKey) {
                                setDismissedTooltipKey(selectedPostKey);
                              }
                            }}
                            className="size-8 rounded-full text-[#C8F135] hover:bg-[#C8F135]/10 hover:text-[#C8F135]"
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>

                      {tooltipLoadingKey === selectedPostKey && !activeTooltip ? (
                        <div className="flex items-center gap-2 text-sm text-white/75">
                          <Loader2 className="size-4 animate-spin text-[#C8F135]" />
                          Lendo o valor estratégico deste conteúdo...
                        </div>
                      ) : activeTooltip ? (
                        <div className="space-y-3">
                          <p className="text-sm leading-relaxed text-white">
                            {activeTooltip.explicacao}
                          </p>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8F135]">
                              Insight
                            </p>
                            <p className="mt-1 text-sm text-white/85">
                              {activeTooltip.insight}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-[#C8F135]">
                            {activeTooltip.cta}
                          </p>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botoes de acao */}
                <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-3">
                  <Button
                    onClick={() => handleToggleComplete(selectedPost, selectedDay.id)}
                    disabled={
                      updatingPost ===
                      (selectedPost.id ||
                        `${selectedPost.time}-${normalizeText(selectedPost.content_type)}-${normalizeText(selectedPost.topic)}`)
                    }
                    variant={selectedPost.completed ? "outline" : "default"}
                    className={cn(
                      "h-14 w-full justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-white hover:bg-white/10",
                      selectedPost.completed
                        ? "border-[#C8F135]/30 bg-[#C8F135]/10 text-[#C8F135] hover:bg-[#C8F135]/20"
                        : "border-[#C8F135]/30 bg-[#C8F135]/10 text-[#C8F135] hover:bg-[#C8F135]/20",
                    )}
                  >
                    {updatingPost ===
                    (selectedPost.id ||
                      `${selectedPost.time}-${normalizeText(selectedPost.content_type)}-${normalizeText(selectedPost.topic)}`) ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : selectedPost.completed ? (
                      <>
                        <X className="size-4" />
                        Desmarcar
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        Marcar como Concluído
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSeeExamples(selectedPost)}
                    className="h-14 w-full justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="size-4" />
                    Ver no Instagram
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.open(getTikTokUrl(selectedPost), "_blank")}
                    className="h-14 w-full justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="size-4" />
                    Ver no TikTok
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

