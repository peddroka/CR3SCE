"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Hash,
  Layout,
  Lightbulb,
  Loader2,
  MessageSquare,
  Palette,
  RefreshCw,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AIDisclosureNotice } from "@/components/lgpd/ai-disclosure-notice";
import { PostPreview, type PostPreviewData } from "@/components/dashboard/post-preview";
import { createClient, getUserSafely } from "@/lib/supabase/client";

type PostFormat = "single" | "carousel" | "reel";
type PostObjective =
  | "engajamento"
  | "vendas"
  | "autoridade"
  | "alcance"
  | "comunidade"
  | "lancamento";

type CarouselSlide = {
  number?: number;
  title?: string;
  body?: string;
  visual_direction?: string;
};

type PaletteColor = {
  name?: string;
  hex?: string;
  role?: string;
};

type GeneratedPost = {
  format: PostFormat;
  caption: { hook: string; body: string; cta: string };
  hashtags: string[];
  carousel_slides?: CarouselSlide[];
  visual_brief: {
    concept: string;
    style_keywords: string[];
    palette: PaletteColor[];
    palette_rationale?: string;
    typography: { display: string; body: string; treatment: string };
    layout: string;
    layout_template?:
      | "typography_oversized"
      | "side_block"
      | "asymmetric_brutal"
      | "frame_card"
      | "swiss_grid";
    elements: string[];
  };
  trend_tips: string[];
  post_time_suggestion: string;
  vibe_summary: string;
};

const FORMAT_OPTIONS: { value: PostFormat; label: string; description: string }[] = [
  {
    value: "single",
    label: "Post único",
    description: "Uma imagem 4:5 com legenda forte",
  },
  {
    value: "carousel",
    label: "Carrossel",
    description: "4 a 7 slides com storytelling",
  },
  {
    value: "reel",
    label: "Reel",
    description: "Roteiro vertical + capa",
  },
];

const OBJECTIVE_OPTIONS: { value: PostObjective; label: string }[] = [
  { value: "engajamento", label: "Engajamento (likes/comentários)" },
  { value: "alcance", label: "Alcance (descoberta de novos seguidores)" },
  { value: "vendas", label: "Vendas / conversão" },
  { value: "autoridade", label: "Autoridade no nicho" },
  { value: "comunidade", label: "Construir comunidade" },
  { value: "lancamento", label: "Lançamento de produto/serviço" },
];

export default function CriarPostPage() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<PostFormat>("single");
  const [objective, setObjective] = useState<PostObjective>("engajamento");
  const [tone, setTone] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [instagramHandle, setInstagramHandle] = useState<string | undefined>();
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Pega o handle do Instagram do business pra exibir no preview
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { user } = await getUserSafely(supabase);
        if (!user) return;
        const { data } = await supabase
          .from("businesses")
          .select("instagram_handle")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data?.instagram_handle) setInstagramHandle(data.instagram_handle);
      } catch {}
    })();
  }, []);

  const totalSlides =
    result?.format === "carousel"
      ? 1 + (result.carousel_slides?.length ?? 0)
      : 1;

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Escreva um tema antes de gerar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/create-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          format,
          objective,
          tone: tone.trim() || undefined,
          extraNotes: extraNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Erro ao gerar post.");
        toast.error(data.error || "Erro ao gerar post.");
        return;
      }

      setResult(data.post);
      setSlideIndex(0);
      toast.success("Post gerado! Confira abaixo.");
    } catch (err) {
      console.error(err);
      setError("Erro de rede ao gerar o post.");
      toast.error("Erro de rede ao gerar o post.");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, label = "Copiado") {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Clipboard não disponível.");
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(label);
  }

  async function downloadCurrentSlide() {
    if (!previewRef.current || !result) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 3, // 360x450 * 3 = 1080x1350 (4:5 nativo Instagram)
        cacheBust: true,
        backgroundColor: undefined,
      });
      const link = document.createElement("a");
      const safeTopic = topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40);
      link.download = `cr3sce-${safeTopic || "post"}-slide${slideIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("PNG baixado!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao gerar PNG. Tente recarregar a página.");
    } finally {
      setDownloading(false);
    }
  }

  const fullCaption = result
    ? `${result.caption.hook}\n\n${result.caption.body}\n\n${result.caption.cta}\n\n${result.hashtags.join(" ")}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-12"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-lime/10 p-2">
            <Wand2 className="size-6 text-lime md:size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Criar Post
            </h1>
            <p className="text-sm text-muted-foreground">
              Posts únicos para o seu negócio, com briefing visual atual.
            </p>
          </div>
        </div>
      </header>

      <AIDisclosureNotice />

      <Card className="border-border/60">
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Tema ou ideia do post</Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: 5 erros que destroem o engajamento de academias pequenas"
              className="min-h-[88px] resize-none"
              maxLength={600}
            />
            <p className="text-right text-xs text-muted-foreground">
              {topic.length}/600
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-3">
              <Label>Formato</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {FORMAT_OPTIONS.map((opt) => {
                  const active = format === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormat(opt.value)}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                        active
                          ? "border-lime bg-lime/10 text-foreground shadow-[0_0_0_3px_rgba(200,241,53,0.15)]"
                          : "border-border bg-background/30 text-muted-foreground hover:border-lime/40 hover:text-foreground",
                      )}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-xs">{opt.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Select
                value={objective}
                onValueChange={(v) => setObjective(v as PostObjective)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tone">Tom (opcional)</Label>
              <Input
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Ex: irreverente, didático, provocador"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra">Observações extras (opcional)</Label>
            <Textarea
              id="extra"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="Coisas que NÃO podem aparecer, referências, links, contexto específico..."
              className="min-h-[64px] resize-none"
              maxLength={500}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Usa o perfil do seu negócio + tendências de design 2026.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="h-11 gap-2 bg-lime text-base font-semibold text-[#111] hover:bg-[#a8d020]"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {result ? "Gerar outro" : "Gerar post"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <SkeletonBlock />
            <SkeletonBlock />
          </motion.div>
        )}

        {result && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <VibeCard
              vibe={result.vibe_summary}
              format={result.format}
              concept={result.visual_brief.concept}
            />

            <PostPreviewSection
              result={result}
              slideIndex={slideIndex}
              totalSlides={totalSlides}
              instagramHandle={instagramHandle}
              previewRef={previewRef}
              onPrev={() => setSlideIndex((i) => Math.max(0, i - 1))}
              onNext={() =>
                setSlideIndex((i) => Math.min(totalSlides - 1, i + 1))
              }
              onDownload={downloadCurrentSlide}
              downloading={downloading}
            />

            <div className="grid gap-4 md:grid-cols-5">
              <CaptionCard
                caption={result.caption}
                hashtags={result.hashtags}
                onCopyAll={() => copyText(fullCaption, "Legenda + hashtags copiados")}
              />
              <VisualBriefCard brief={result.visual_brief} />
            </div>

            {result.format === "carousel" && result.carousel_slides && result.carousel_slides.length > 0 && (
              <CarouselSlidesCard slides={result.carousel_slides} />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <TrendTipsCard tips={result.trend_tips} />
              <PostingTimeCard suggestion={result.post_time_suggestion} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => copyText(fullCaption, "Tudo copiado")}
                className="gap-2"
              >
                <Copy className="size-4" /> Copiar tudo
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="gap-2 bg-lime text-[#111] hover:bg-[#a8d020]"
              >
                <RefreshCw className="size-4" /> Gerar outra versão
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SkeletonBlock() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-3">
          <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-full animate-pulse rounded bg-white/5" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-white/5" />
        </div>
      </CardContent>
    </Card>
  );
}

function PostPreviewSection({
  result,
  slideIndex,
  totalSlides,
  instagramHandle,
  previewRef,
  onPrev,
  onNext,
  onDownload,
  downloading,
}: {
  result: GeneratedPost;
  slideIndex: number;
  totalSlides: number;
  instagramHandle?: string;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onPrev: () => void;
  onNext: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  const showCarouselControls = result.format === "carousel" && totalSlides > 1;
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:gap-8">
        <div className="flex w-full max-w-[360px] flex-col gap-3 self-center md:self-start">
          <PostPreview
            ref={previewRef}
            post={result as PostPreviewData}
            slideIndex={slideIndex}
            totalSlides={totalSlides}
            instagramHandle={instagramHandle}
          />
          {showCarouselControls && (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={slideIndex === 0}
                className="gap-1"
              >
                <ChevronLeft className="size-4" /> Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                {slideIndex + 1} / {totalSlides}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={slideIndex === totalSlides - 1}
                className="gap-1"
              >
                Próximo <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
          <Button
            onClick={onDownload}
            disabled={downloading}
            className="gap-2 bg-lime text-[#111] hover:bg-[#a8d020]"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Baixar PNG (1080x1350)
          </Button>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-lime">
              Preview do post
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              Design pronto, formato Instagram 4:5
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Renderizado com a paleta e o layout escolhidos pela IA para este
              tema. Você pode baixar como PNG e usar direto, ou levar o briefing
              ao Canva pra ajustar.
            </p>
          </div>
          {result.visual_brief.palette_rationale && (
            <div className="rounded-lg border border-lime/20 bg-lime/5 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-lime">
                Por que essas cores
              </p>
              <p className="text-sm text-muted-foreground">
                {result.visual_brief.palette_rationale}
              </p>
            </div>
          )}
          {result.visual_brief.layout_template && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Layout: </span>
              {result.visual_brief.layout_template.replace(/_/g, " ")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function VibeCard({
  vibe,
  format,
  concept,
}: {
  vibe: string;
  format: string;
  concept: string;
}) {
  return (
    <Card className="overflow-hidden border-lime/30 bg-gradient-to-br from-lime/10 via-background to-background">
      <CardContent className="flex flex-col gap-2 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-lime">
            Vibe do post
          </p>
          <p className="mt-2 font-bebas text-3xl leading-tight text-foreground md:text-4xl">
            {vibe}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{concept}</p>
        </div>
        <div className="shrink-0 rounded-full border border-lime/40 bg-lime/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-lime">
          {format === "carousel"
            ? "Carrossel"
            : format === "reel"
              ? "Reel"
              : "Post único"}
        </div>
      </CardContent>
    </Card>
  );
}

function CaptionCard({
  caption,
  hashtags,
  onCopyAll,
}: {
  caption: { hook: string; body: string; cta: string };
  hashtags: string[];
  onCopyAll: () => void;
}) {
  return (
    <Card className="md:col-span-3">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <MessageSquare className="size-4 text-lime" /> Legenda
          </h2>
          <Button variant="ghost" size="sm" onClick={onCopyAll} className="gap-2">
            <Copy className="size-3.5" /> Copiar
          </Button>
        </div>

        <div className="space-y-4 text-sm leading-relaxed">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Gancho
            </p>
            <p className="font-bebas text-2xl leading-tight text-foreground">
              {caption.hook}
            </p>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Corpo
            </p>
            <p className="whitespace-pre-wrap text-foreground">{caption.body}</p>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              CTA
            </p>
            <p className="rounded-lg border border-lime/30 bg-lime/5 p-3 text-foreground">
              {caption.cta}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Hash className="size-3" /> Hashtags ({hashtags.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border bg-white/5 px-2 py-1 text-xs text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VisualBriefCard({ brief }: { brief: GeneratedPost["visual_brief"] }) {
  return (
    <Card className="md:col-span-2">
      <CardContent className="flex flex-col gap-5 p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Layout className="size-4 text-lime" /> Briefing visual
        </h2>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Palette className="mr-1 inline size-3" /> Paleta
          </p>
          <div className="flex flex-wrap gap-2">
            {brief.palette?.map((color, idx) => (
              <div
                key={`${color.hex}-${idx}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
              >
                <span
                  className="block size-8 rounded-md border border-white/10"
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
                <div className="text-xs leading-tight">
                  <p className="font-semibold text-foreground">{color.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {color.hex}
                  </p>
                  {color.role && (
                    <p className="text-[10px] uppercase tracking-widest text-lime">
                      {color.role}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Type className="mr-1 inline size-3" /> Tipografia
          </p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Display:</span>{" "}
              <span className="font-semibold text-foreground">{brief.typography?.display}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Body:</span>{" "}
              <span className="font-semibold text-foreground">{brief.typography?.body}</span>
            </p>
            <p className="text-xs text-muted-foreground">{brief.typography?.treatment}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Layout
          </p>
          <p className="text-sm text-muted-foreground">{brief.layout}</p>
        </div>

        {brief.style_keywords?.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Style keywords
            </p>
            <div className="flex flex-wrap gap-1.5">
              {brief.style_keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-lime/30 bg-lime/10 px-2 py-0.5 text-[11px] font-medium text-lime"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {brief.elements?.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Elementos sugeridos
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {brief.elements.map((el, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-lime" />
                  <span>{el}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CarouselSlidesCard({ slides }: { slides: CarouselSlide[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <h2 className="text-base font-semibold text-foreground">
          Slides do carrossel
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card/40 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bebas text-2xl text-lime">
                  {String(slide.number ?? idx + 1).padStart(2, "0")}
                </span>
                {slide.title && (
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {slide.title}
                  </span>
                )}
              </div>
              {slide.body && (
                <p className="mb-2 whitespace-pre-wrap text-sm text-foreground">
                  {slide.body}
                </p>
              )}
              {slide.visual_direction && (
                <p className="border-t border-border pt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-lime">visual:</span>{" "}
                  {slide.visual_direction}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TrendTipsCard({ tips }: { tips: string[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Lightbulb className="size-4 text-lime" /> Tendências 2026 aplicadas
        </h2>
        <ul className="space-y-2 text-sm">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 text-muted-foreground">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-lime" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function PostingTimeCard({ suggestion }: { suggestion: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Clock className="size-4 text-lime" /> Quando postar
        </h2>
        <p className="text-sm text-muted-foreground">{suggestion}</p>
      </CardContent>
    </Card>
  );
}
