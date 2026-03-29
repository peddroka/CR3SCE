"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Loader2,
  Palette,
  RefreshCw,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Step = "initial" | "customizing" | "generating" | "result" | "error";
type Format = "feed" | "story";
type Style = "dark" | "light" | "colorful" | "minimal";

interface ImageOption {
  id: string;
  url: string;
  label: string;
}

interface ImageCreatorClientProps {
  postId?: string;
  initialPrompt?: string;
  initialTitle?: string;
  format?: Format;
}

interface CreateImageResponse {
  image: string;
  alternateImage?: string;
  format: Format;
  alternateFormat?: Format;
  remaining?: number;
}

function normalizeOption(
  value: string | ImageOption,
  prefix: string,
  index: number,
): ImageOption {
  if (typeof value === "string") {
    return {
      id: `${prefix}-${index}`,
      url: value,
      label: `${prefix === "bg" ? "Fundo" : "Elemento"} ${index + 1}`,
    };
  }

  return value;
}

const LIMIT = 10;
const MESSAGES = [
  "Buscando o melhor fundo para o seu negocio...",
  "Aplicando sua identidade visual...",
  "Compondo o layout...",
  "Adicionando iluminacao e textura...",
  "Finalizando os detalhes...",
];
const STAGES = [14, 32, 51, 73, 91];
const STYLES: Array<{ value: Style; label: string; desc: string }> = [
  { value: "dark", label: "Escuro Premium", desc: "Mais contraste e presenca." },
  { value: "light", label: "Claro Moderno", desc: "Leve, limpo e elegante." },
  { value: "colorful", label: "Colorido Vibrante", desc: "Mais impacto visual." },
  { value: "minimal", label: "Minimalista", desc: "Direto e sofisticado." },
];
const SOLID_BACKGROUND_OPTION: ImageOption = {
  id: "solid-background",
  url: "",
  label: "Fundo liso",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a geração.";
}

function getDisplayPrompt(rawPrompt: string, title?: string): string {
  if (title && title.trim()) {
    return `Criar imagem para o post: "${title.trim()}"`;
  }

  const quoted = rawPrompt.match(/"([^"]+)"/);
  if (quoted?.[1]) {
    return `Criar imagem sobre: "${quoted[1].trim()}"`;
  }

  return "Gerar imagem profissional para este post";
}

function downloadImage(imageData: string, format: Format) {
  const link = document.createElement("a");
  link.href = imageData;
  link.download = `cr3sce-${format}-${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ImageCreatorClient({
  postId,
  initialPrompt,
  initialTitle,
  format: initialFormat = "feed",
}: ImageCreatorClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("initial");
  const [format, setFormat] = useState<Format>(initialFormat);
  const [style, setStyle] = useState<Style>("dark");
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [displayPrompt, setDisplayPrompt] = useState(
    getDisplayPrompt(initialPrompt ?? "", initialTitle),
  );
  const [remaining, setRemaining] = useState(LIMIT);
  const [limit, setLimit] = useState(LIMIT);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [customStep, setCustomStep] = useState<0 | 1 | 2>(0);
  const [bgOptions, setBgOptions] = useState<ImageOption[]>([]);
  const [elementOptions, setElementOptions] = useState<ImageOption[]>([]);
  const [selectedBg, setSelectedBg] = useState<ImageOption | null>(null);
  const [selectedElement, setSelectedElement] = useState<ImageOption | null>(null);
  const [images, setImages] = useState<Partial<Record<Format, string>>>({});
  const [primaryFormat, setPrimaryFormat] = useState<Format>(initialFormat);

  const preview = images[format] || images[primaryFormat] || null;
  const formatLabel = format === "feed" ? "Feed 1:1" : "Story 9:16";
  const counterLabel = `${remaining}/${limit} geracoes restantes nesta hora`;

  useEffect(() => {
    setPrompt(initialPrompt ?? "");
    setDisplayPrompt(getDisplayPrompt(initialPrompt ?? "", initialTitle));
  }, [initialPrompt, initialTitle]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/create-image", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { remaining?: number; limit?: number };
        if (cancelled) return;
        setRemaining(typeof data.remaining === "number" ? data.remaining : LIMIT);
        setLimit(typeof data.limit === "number" ? data.limit : LIMIT);
      } catch {}
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (step !== "generating") return;
    setMessageIndex(0);
    setProgress(STAGES[0]);
    const interval = window.setInterval(() => {
      setMessageIndex((current) => {
        const next = (current + 1) % MESSAGES.length;
        setProgress((value) => Math.max(value, STAGES[next] ?? value));
        return next;
      });
    }, 2000);
    return () => window.clearInterval(interval);
  }, [step]);

  const handleBack = () => router.push("/dashboard/calendario");

  const applyResult = (data: CreateImageResponse) => {
    const nextImages: Partial<Record<Format, string>> = {
      [data.format]: data.image,
    };
    if (data.alternateFormat && data.alternateImage) {
      nextImages[data.alternateFormat] = data.alternateImage;
    }
    setImages(nextImages);
    setPrimaryFormat(data.format);
    setProgress(100);
    setRemaining((current) =>
      typeof data.remaining === "number"
        ? Math.max(0, data.remaining)
        : Math.max(0, current - 1),
    );
    setAttempt((current) => current + 1);
    setStep("result");
  };

  const handleGenerate = async (
    nextBg: ImageOption | null = selectedBg,
    nextElement: ImageOption | null = selectedElement,
  ) => {
    if (!prompt.trim()) {
      setError("Edite ou informe um prompt antes de gerar.");
      return;
    }
    if (remaining <= 0) {
      setError("Você atingiu o limite de 10 gerações por hora.");
      setStep("error");
      return;
    }

    setError(null);
    setStep("generating");
    setProgress(STAGES[0]);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("/api/create-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          postId,
          title: initialTitle ?? "",
          visualPrompt: prompt,
          format,
          style,
          selectedBgUrl: nextBg?.url ?? null,
          selectedBgLabel: nextBg?.label ?? "",
          selectedElementUrl: nextElement?.url ?? null,
          selectedElementLabel: nextElement?.label ?? "",
          attempt,
        }),
      });
      const data = (await res.json()) as CreateImageResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "Erro ao gerar imagem.");
      applyResult(data);
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        setError("A geracao demorou mais de 30 segundos. Tente novamente.");
      } else {
        setError(getErrorMessage(requestError));
      }
      setStep("error");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const handlePersonalize = async () => {
    if (!prompt.trim()) {
      setError("Edite ou informe um prompt antes de personalizar.");
      return;
    }
    setError(null);
    setLoadingOptions(true);
    try {
      const res = await fetch(
        `/api/image-options?prompt=${encodeURIComponent(prompt)}&format=${format}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as {
        backgrounds?: Array<string | ImageOption>;
        elements?: Array<string | ImageOption>;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Erro ao carregar opcoes.");
      setBgOptions(
        (data.backgrounds ?? []).map((item, index) =>
          normalizeOption(item, "bg", index),
        ),
      );
      setElementOptions(
        (data.elements ?? []).map((item, index) =>
          normalizeOption(item, "element", index),
        ),
      );
      setSelectedBg(null);
      setSelectedElement(null);
      setCustomStep(0);
      setStep("customizing");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingOptions(false);
    }
  };

  const ErrorBanner = error ? (
    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {error}
    </div>
  ) : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="h-auto gap-2 px-0 text-[#8f8f8f] hover:bg-transparent hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Voltar ao Calendário
          </Button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-white">Criar Imagem</h1>
              <div
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  format === "feed"
                    ? "border-[#C8F135]/30 bg-[#C8F135]/10 text-[#C8F135]"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-300",
                )}
              >
                {formatLabel}
              </div>
            </div>
            <p className="max-w-2xl text-sm text-[#979797]">
              {initialTitle
                ? `Prompt e composição deste criativo para "${initialTitle}".`
                : "Use o prompt da IA e gere o criativo sem uploads obrigatórios."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-[#666]">Limite atual</p>
          <p className="mt-1 text-sm font-semibold text-white">{counterLabel}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["feed", "story"] as Format[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFormat(value)}
            className={cn(
              "flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
              format === value
                ? "border-[#C8F135] bg-[#C8F135]/10 text-[#C8F135]"
                : "border-white/10 bg-white/5 text-[#a0a0a0] hover:border-white/20 hover:text-white",
            )}
          >
            {value === "feed" ? "Feed 1:1" : "Story 9:16"}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101010]">
        <CardContent className="p-0">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(200,241,53,0.15),transparent_35%),linear-gradient(180deg,#121212_0%,#0a0a0a_100%)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#707070]">Prompt visual</p>
            <p className="mt-2 max-w-3xl text-sm text-[#b4b4b4]">
              O sistema busca referências nas APIs e compõe a arte final em cima desse prompt.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "initial" && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]"
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white">Sobre o que é este post</p>
                    <Textarea
                      value={displayPrompt}
                      onChange={(event) => {
                        setDisplayPrompt(event.target.value);
                        setPrompt(event.target.value);
                      }}
                      rows={6}
                      className="min-h-[180px] rounded-2xl border-white/10 bg-white/5 text-sm text-white shadow-none focus-visible:ring-[#C8F135]/30"
                    />
                  </div>

                  {ErrorBanner}

                  <div className="grid gap-3 md:grid-cols-2">
                    <Button
                      onClick={() => void handleGenerate()}
                      disabled={remaining <= 0}
                      className="h-14 gap-3 rounded-2xl bg-[#C8F135] text-base font-black text-[#111] hover:bg-[#b6dd30]"
                    >
                      <Zap className="size-5" />
                      Gerar Agora
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handlePersonalize()}
                      disabled={loadingOptions || remaining <= 0}
                      className="h-14 gap-3 rounded-2xl border-white/10 bg-white/5 text-base font-semibold text-white hover:bg-white/10"
                    >
                      {loadingOptions ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Palette className="size-5" />
                      )}
                      Personalizar
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/30 p-5">
                  <div className="rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4">
                    <p className="text-sm font-semibold text-[#C8F135]">Fluxo direto, sem uploads obrigatórios</p>
                    <p className="mt-2 text-sm text-[#ababab]">
                      Gere direto ou personalize fundo, elemento e estilo antes da composição.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#9d9d9d]">
                      <span className="font-semibold text-white">Opção A:</span> gerar agora.
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#9d9d9d]">
                      <span className="font-semibold text-white">Opção B:</span> escolher componentes antes de gerar.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "customizing" && (
              <motion.div
                key="customizing"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="space-y-6 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-white">Personalizar composição</h2>
                    <p className="mt-1 text-sm text-[#979797]">Escolha fundo, elemento e estilo.</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStep("initial");
                      setError(null);
                    }}
                    className="gap-2 text-[#9a9a9a] hover:bg-white/5 hover:text-white"
                  >
                    <ArrowLeft className="size-4" />
                    Voltar
                  </Button>
                </div>

                {ErrorBanner}

                <div className="flex gap-2">
                  {["Fundo", "Elemento", "Estilo"].map((label, index) => (
                    <div
                      key={label}
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2 text-center text-xs font-semibold",
                        customStep === index
                          ? "border-[#C8F135] bg-[#C8F135]/10 text-[#C8F135]"
                          : index < customStep
                            ? "border-[#C8F135]/30 text-[#C8F135]/70"
                            : "border-white/10 text-[#888]",
                      )}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {customStep === 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-white">Passo 1: Escolha o fundo</p>
                    {bgOptions.length === 0 ? (
                      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
                        <p className="mb-3 text-sm text-yellow-300">
                          Você pode seguir com fundo automático ou usar fundo liso.
                        </p>
                        <div className="flex flex-col gap-2 md:flex-row md:justify-center">
                          <Button
                            onClick={() => void handleGenerate(null, null)}
                            className="bg-[#C8F135] font-semibold text-[#111] hover:bg-[#b6dd30]"
                          >
                            Gerar com fundo automático
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedBg(SOLID_BACKGROUND_OPTION)}
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                          >
                            Usar fundo liso
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {bgOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedBg(option)}
                            className={cn(
                              "overflow-hidden rounded-2xl border-2 bg-white/5 text-left",
                              selectedBg?.id === option.id
                                ? "border-[#C8F135]"
                                : "border-white/10",
                            )}
                          >
                            <div className="aspect-square">
                              <img
                                src={option.url}
                                alt={option.label}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="border-t border-white/10 px-3 py-2 text-xs text-[#d4d4d4]">
                              {option.label}
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedBg(SOLID_BACKGROUND_OPTION)}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-2xl border-2 bg-[linear-gradient(135deg,#0a0a0a_0%,#1a1a2e_100%)] p-4 text-center text-sm font-semibold",
                            selectedBg?.id === SOLID_BACKGROUND_OPTION.id
                              ? "border-[#C8F135] text-[#C8F135]"
                              : "border-white/10 text-[#a5a5a5]",
                          )}
                        >
                          Fundo liso
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep("initial")} className="rounded-xl border-white/10 bg-white/5 text-white">Cancelar</Button>
                      <Button onClick={() => setCustomStep(1)} className="flex-1 rounded-xl bg-[#C8F135] font-semibold text-[#111]">Próximo</Button>
                    </div>
                  </div>
                )}

                {customStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-white">Passo 2: Adicionar elemento</p>
                    {elementOptions.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                        <p className="mb-3 text-sm text-[#888]">Nenhum elemento disponível.</p>
                        <Button
                          onClick={() => setCustomStep(2)}
                          className="bg-[#C8F135] text-[#111] hover:bg-[#b6dd30]"
                        >
                          Continuar sem elemento
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {elementOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedElement(option)}
                            className={cn(
                              "overflow-hidden rounded-2xl border-2 bg-white/5 text-left",
                              selectedElement?.id === option.id
                                ? "border-[#C8F135]"
                                : "border-white/10",
                            )}
                          >
                            <div className="aspect-square p-5">
                              <img
                                src={option.url}
                                alt={option.label}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="border-t border-white/10 px-3 py-2 text-xs text-[#d4d4d4]">
                              {option.label}
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedElement(null)}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-2xl border-2 bg-white/5 p-4 text-center text-sm font-semibold",
                            selectedElement === null ? "border-[#C8F135] text-[#C8F135]" : "border-white/10 text-[#a5a5a5]",
                          )}
                        >
                          Nenhum
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCustomStep(0)} className="rounded-xl border-white/10 bg-white/5 text-white">Voltar</Button>
                      <Button onClick={() => setCustomStep(2)} className="flex-1 rounded-xl bg-[#C8F135] font-semibold text-[#111]">Próximo</Button>
                    </div>
                  </div>
                )}

                {customStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-white">Passo 3: Estilo visual</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {STYLES.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setStyle(option.value)}
                          className={cn(
                            "rounded-2xl border-2 p-4 text-left",
                            style === option.value ? "border-[#C8F135] bg-[#C8F135]/10" : "border-white/10 bg-white/5",
                          )}
                        >
                          <p className="text-sm font-semibold text-white">{option.label}</p>
                          <p className="mt-1 text-sm text-[#9d9d9d]">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCustomStep(1)} className="rounded-xl border-white/10 bg-white/5 text-white">Voltar</Button>
                      <Button onClick={() => void handleGenerate(selectedBg, selectedElement)} disabled={remaining <= 0} className="flex-1 rounded-xl bg-[#C8F135] font-black text-[#111]">Gerar com minhas escolhas</Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="flex min-h-[520px] flex-col items-center justify-center gap-6 p-6 text-center"
              >
                <div className="relative flex size-24 items-center justify-center rounded-full border border-[#C8F135]/20 bg-[#C8F135]/5">
                  <motion.div
                    className="absolute inset-2 rounded-full border border-[#C8F135]/30"
                    animate={{ scale: [0.96, 1.06, 0.96], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <Wand2 className="relative z-10 size-9 text-[#C8F135]" />
                </div>
                <div className="w-full max-w-xl space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">Gerando sua imagem</h2>
                    <p className="text-sm text-[#9f9f9f]">{MESSAGES[messageIndex]}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#8d8d8d]">
                      <span>Progresso da composição</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-white/10" />
                  </div>
                  <p className="text-xs text-[#b1b1b1]">Timeout máximo de 30 segundos.</p>
                </div>
              </motion.div>
            )}

            {step === "result" && preview && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="space-y-6 p-6"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-black text-white">Imagem pronta</h2>
                  <p className="text-sm text-[#979797]">A versão principal e a adaptação alternada já estão disponíveis.</p>
                </div>
                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/40 p-3">
                  <img src={preview} alt="Imagem gerada" className="mx-auto max-h-[72vh] rounded-[22px] object-contain" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button onClick={() => images.feed && downloadImage(images.feed, "feed")} disabled={!images.feed} className="gap-2 rounded-2xl bg-[#C8F135] font-semibold text-[#111]">
                    <Download className="size-4" />
                    Baixar Feed
                  </Button>
                  <Button variant="outline" onClick={() => images.story && downloadImage(images.story, "story")} disabled={!images.story} className="gap-2 rounded-2xl border-white/10 bg-white/5 text-white">
                    <Download className="size-4" />
                    Baixar Story
                  </Button>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <Button variant="outline" onClick={() => void handleGenerate(selectedBg, selectedElement)} disabled={remaining <= 0} className="flex-1 gap-2 rounded-2xl border-white/10 bg-white/5 text-white">
                    <RefreshCw className="size-4" />
                    Não gostei - Gerar outra
                  </Button>
                  <Button variant="ghost" onClick={handleBack} className="gap-2 rounded-2xl text-[#9d9d9d]">
                    <ArrowLeft className="size-4" />
                    Voltar ao Calendário
                  </Button>
                </div>
                <p className="text-center text-xs text-[#7f7f7f]">{remaining} geracoes restantes nesta hora.</p>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center"
              >
                <div className="flex size-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                  <ImageIcon className="size-8 text-red-300" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white">Não foi possível gerar agora</h2>
                  <p className="max-w-md text-sm text-[#a0a0a0]">{error || "Tente novamente daqui a pouco."}</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <Button onClick={() => { setStep("initial"); setError(null); setProgress(0); }} className="gap-2 rounded-2xl bg-[#C8F135] font-semibold text-[#111]">
                    <RefreshCw className="size-4" />
                    Tentar novamente
                  </Button>
                  <Button variant="ghost" onClick={handleBack} className="gap-2 rounded-2xl text-[#9d9d9d]">
                    <ArrowLeft className="size-4" />
                    Voltar ao Calendário
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
