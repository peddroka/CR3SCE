"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Captions,
  Check,
  Clapperboard,
  Download,
  FastForward,
  Film,
  ImageIcon,
  Loader2,
  Music,
  RefreshCcw,
  Scissors,
  Send,
  Sparkles,
  Square,
  Sunset,
  Video,
  VolumeX,
  Wand2,
  Wand,
  Smartphone,
  Star,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCEPTED_FORMATS = ".mp4,.mov,.avi,.webm";
const PROCESSING_STEPS = [
  "Recebendo seu vídeo...",
  "Aplicando presets...",
  "Renderizando vinhetas animadas...",
  "Finalizando edição...",
];

type PresetKey =
  | "captions"
  | "trim"
  | "intro"
  | "outro"
  | "enhance"
  | "vertical"
  | "square"
  | "speed"
  | "music"
  | "mute"
  | "fade"
  | "highlights";

interface PresetDef {
  key: PresetKey;
  icon: typeof Captions;
  title: string;
  description: string;
  badge?: string;
}

const PRESETS: PresetDef[] = [
  {
    key: "highlights",
    icon: Wand,
    title: "Melhores momentos",
    description: "IA detecta e mantém só os trechos com fala/som",
    badge: "IA",
  },
  {
    key: "intro",
    icon: Star,
    title: "Vinheta de entrada",
    description: "Logo animada CR3SCE no início do vídeo",
    badge: "Remotion",
  },
  {
    key: "outro",
    icon: Sparkles,
    title: "Vinheta de saída",
    description: "Encerramento com CTA animado",
    badge: "Remotion",
  },
  {
    key: "captions",
    icon: Captions,
    title: "Legendas automáticas",
    description: "Transcrição IA + legendas queimadas",
  },
  {
    key: "trim",
    icon: Scissors,
    title: "Cortar trechos",
    description: "Define início e fim em segundos",
  },
  {
    key: "enhance",
    icon: Wand2,
    title: "Melhorar qualidade",
    description: "Contraste, brilho e nitidez",
  },
  {
    key: "vertical",
    icon: Smartphone,
    title: "Estilo Reels (9:16)",
    description: "Recorta para 1080×1920 vertical",
  },
  {
    key: "square",
    icon: Square,
    title: "Estilo feed (1:1)",
    description: "Recorta para 1080×1080 quadrado",
  },
  {
    key: "speed",
    icon: FastForward,
    title: "Acelerar vídeo",
    description: "1.25x, 1.5x ou 2x",
  },
  {
    key: "music",
    icon: Music,
    title: "Trilha sonora",
    description: "Anexe uma música de fundo",
  },
  {
    key: "mute",
    icon: VolumeX,
    title: "Silenciar áudio",
    description: "Remove o áudio original do vídeo",
  },
  {
    key: "fade",
    icon: Sunset,
    title: "Fade in/out",
    description: "Transição suave nas pontas",
  },
];

interface PresetConfig {
  trimStart: number;
  trimEnd: number;
  speedFactor: number;
  introTagline: string;
  outroTagline: string;
  musicVolume: number;
  originalVolume: number;
}

interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
  reached: boolean;
}

interface VideoResult {
  jobId: string;
  summary: string;
  previewUrl: string;
  downloadUrl: string;
  warnings: string[];
  operations: Array<{ type: string; label: string }>;
}

export function VideoEditorClient({
  userId,
  businessName,
}: {
  userId: string;
  businessName: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const musicRef = useRef<HTMLInputElement | null>(null);
  const introLogoRef = useRef<HTMLInputElement | null>(null);
  const outroLogoRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [introLogoFile, setIntroLogoFile] = useState<File | null>(null);
  const [outroLogoFile, setOutroLogoFile] = useState<File | null>(null);
  const [introLogoPreview, setIntroLogoPreview] = useState<string | null>(null);
  const [outroLogoPreview, setOutroLogoPreview] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [activePresets, setActivePresets] = useState<Set<PresetKey>>(new Set());
  const [config, setConfig] = useState<PresetConfig>({
    trimStart: 0,
    trimEnd: 30,
    speedFactor: 1.5,
    introTagline: "Conteúdo que cresce",
    outroTagline: "Siga @cr3sce",
    musicVolume: 0.3,
    originalVolume: 0.85,
  });
  const [instruction, setInstruction] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [progress, setProgress] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaState>({
    used: 0,
    limit: 5,
    remaining: 5,
    reached: false,
  });
  const [result, setResult] = useState<VideoResult | null>(null);

  const hasReachedLimit = quota.reached;
  const hasAnyAction = activePresets.size > 0 || instruction.trim().length > 0;
  const canSubmit = selectedFile && hasAnyAction && !isSubmitting && !hasReachedLimit;

  useEffect(() => {
    void loadQuota();
  }, [userId]);

  // Generate local preview for the uploaded file
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Logo previews
  useEffect(() => {
    if (!introLogoFile) {
      setIntroLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(introLogoFile);
    setIntroLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [introLogoFile]);

  useEffect(() => {
    if (!outroLogoFile) {
      setOutroLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(outroLogoFile);
    setOutroLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [outroLogoFile]);

  useEffect(() => {
    if (!isSubmitting) return;

    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + 6, 92));
      setProcessingStep((current) =>
        current < PROCESSING_STEPS.length - 1 ? current + 1 : current,
      );
    }, 1500);

    return () => window.clearInterval(interval);
  }, [isSubmitting]);

  async function loadQuota() {
    try {
      const response = await fetch("/api/video-editor");
      if (!response.ok) return;
      const data = (await response.json()) as QuotaState;
      setQuota(data);
    } catch {}
  }

  function triggerStartParticles() {
    confetti({
      particleCount: 36,
      spread: 70,
      startVelocity: 20,
      gravity: 0.7,
      colors: ["#C8F135", "#ffffff", "#9fb82b"],
      origin: { y: 0.72 },
    });
  }

  function triggerSuccessParticles() {
    confetti({
      particleCount: 120,
      spread: 90,
      startVelocity: 30,
      colors: ["#C8F135", "#ffffff"],
      origin: { y: 0.6 },
    });
  }

  function togglePreset(key: PresetKey) {
    setActivePresets((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        // Vertical and square are mutually exclusive
        if (key === "vertical") next.delete("square");
        if (key === "square") next.delete("vertical");
        next.add(key);

        // Auto-open file picker for music preset if no file yet
        if (key === "music" && !musicFile) {
          setTimeout(() => musicRef.current?.click(), 100);
        }
      }
      return next;
    });
    setResult(null);
  }

  function handleSelectFile(file: File | null) {
    if (!file) return;
    const valid =
      file.type === "video/mp4" ||
      file.type === "video/quicktime" ||
      file.type === "video/x-msvideo" ||
      file.type === "video/webm";

    if (!valid) {
      setError("Formato inválido. Use .mp4, .mov, .avi ou .webm.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResult(null);
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleSelectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function buildOperations() {
    const ops: Array<Record<string, unknown>> = [];

    if (activePresets.has("highlights")) {
      ops.push({
        type: "highlights",
        label: "Detectar e cortar melhores momentos",
      });
    }
    if (activePresets.has("captions")) {
      ops.push({ type: "transcribe", label: "Transcrever áudio" });
      ops.push({ type: "burn_subtitles", label: "Queimar legendas" });
    }
    if (activePresets.has("trim")) {
      ops.push({
        type: "trim",
        label: `Cortar de ${config.trimStart}s até ${config.trimEnd}s`,
        startSecond: config.trimStart,
        endSecond: config.trimEnd,
      });
    }
    if (activePresets.has("intro")) {
      ops.push({
        type: "intro",
        label: "Vinheta de entrada animada",
        brandName: "CR3SCE",
        tagline: config.introTagline,
      });
    }
    if (activePresets.has("outro")) {
      ops.push({
        type: "outro",
        label: "Vinheta de saída animada",
        brandName: "CR3SCE",
        tagline: config.outroTagline,
      });
    }
    if (activePresets.has("enhance")) {
      ops.push({ type: "enhance", label: "Melhorar imagem" });
    }
    if (activePresets.has("vertical")) {
      ops.push({ type: "aspect_vertical", label: "Estilo Reels (9:16)" });
    }
    if (activePresets.has("square")) {
      ops.push({ type: "aspect_square", label: "Formato quadrado (1:1)" });
    }
    if (activePresets.has("speed")) {
      ops.push({
        type: "speed",
        label: `Acelerar ${config.speedFactor}x`,
        speedFactor: config.speedFactor,
      });
    }
    if (activePresets.has("music") && musicFile) {
      ops.push({
        type: "music",
        label: `Trilha sonora (${musicFile.name})`,
        musicVolume: config.musicVolume,
        originalVolume: activePresets.has("mute") ? 0 : config.originalVolume,
      });
    }
    if (activePresets.has("mute")) {
      ops.push({ type: "mute", label: "Silenciar áudio original" });
    }
    if (activePresets.has("fade")) {
      ops.push({ type: "fade", label: "Fade in/out nas pontas" });
    }

    return ops;
  }

  async function submitVideoEdit() {
    if (!selectedFile || !hasAnyAction || isSubmitting || hasReachedLimit) return;

    // Validation: music preset active but no file uploaded
    if (activePresets.has("music") && !musicFile) {
      setError(
        "Você ativou o preset 'Trilha sonora' mas não anexou nenhuma música. Anexe um arquivo de áudio ou desative o preset.",
      );
      return;
    }

    // Validation: trim values make sense
    if (activePresets.has("trim")) {
      if (config.trimEnd <= config.trimStart) {
        setError("O fim do corte precisa ser maior que o início.");
        return;
      }
      if (videoDuration && config.trimStart >= videoDuration) {
        setError(
          `O início do corte (${config.trimStart}s) é maior que a duração do vídeo (${videoDuration.toFixed(1)}s).`,
        );
        return;
      }
    }

    setError(null);
    setIsSubmitting(true);
    setProcessingStep(0);
    setProgress(12);
    triggerStartParticles();

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("instruction", instruction.trim());
    if (activePresets.size > 0) {
      formData.append("presets", JSON.stringify(buildOperations()));
    }
    if (musicFile && activePresets.has("music")) {
      formData.append("music", musicFile);
    }
    if (introLogoFile && activePresets.has("intro")) {
      formData.append("introLogo", introLogoFile);
    }
    if (outroLogoFile && activePresets.has("outro")) {
      formData.append("outroLogo", outroLogoFile);
    }
    formData.append("brandName", "CR3SCE");

    try {
      const response = await fetch("/api/video-editor", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setQuota(payload.quota || quota);
        throw new Error(
          payload.error || "Não foi possível editar o vídeo agora.",
        );
      }

      setProgress(100);
      setProcessingStep(PROCESSING_STEPS.length - 1);
      setResult(payload as VideoResult);
      setQuota(payload.quota as QuotaState);
      triggerSuccessParticles();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível editar o vídeo agora.",
      );
    } finally {
      window.setTimeout(() => setIsSubmitting(false), 250);
    }
  }

  const summaryChips = useMemo(() => {
    const chips: string[] = [];
    activePresets.forEach((key) => {
      const def = PRESETS.find((p) => p.key === key);
      if (def) chips.push(def.title);
    });
    return chips;
  }, [activePresets]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      {/* Aviso BETA */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-400" />
        <div className="flex-1">
          <p className="font-semibold text-yellow-300">
            Funcionalidade em BETA
          </p>
          <p className="mt-1 leading-relaxed text-yellow-100/80">
            O editor de vídeo está em fase de testes. Algumas predefinições podem
            falhar, processar com lentidão ou gerar resultados inconsistentes.
            Para conteúdo de produção, recomendamos editar em um app dedicado
            até o lançamento oficial.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10 px-3 py-1 text-xs font-medium text-[#C8F135]">
            <Clapperboard className="size-3.5 shrink-0" />
            <span className="truncate">Studio de edição com IA · {businessName}</span>
          </div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-white md:text-4xl">
            Editar Vídeo
            <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">
              Beta
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8d8d8d] md:text-base">
            Anexe seu vídeo, escolha as predefinições ou descreva como quer o
            resultado. As vinhetas animadas usam{" "}
            <span className="text-[#C8F135]">Remotion</span> para gerar
            aberturas e encerramentos da sua marca.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5f5f5f]">
            Limite diário
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {quota.used} de {quota.limit} edições hoje
          </p>
          <p className="mt-1 text-xs text-[#777]">
            {hasReachedLimit
              ? "Você já editou 5 vídeos hoje. Renova à meia-noite."
              : `${quota.remaining} edições restantes`}
          </p>
        </div>
      </div>

      {/* Step 1 — Upload */}
      <Card className="overflow-hidden rounded-3xl border border-border bg-card">
        <CardHeader className="border-b border-border/70 pb-5">
          <CardTitle className="flex items-center gap-3 text-lg text-white">
            <div className="flex size-9 items-center justify-center rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/10 text-sm font-bold text-[#C8F135]">
              1
            </div>
            Anexe seu vídeo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  inputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-8 text-center transition-all",
                dragging
                  ? "border-[#C8F135] bg-[#C8F135]/10"
                  : "border-border bg-[radial-gradient(circle_at_top,_rgba(200,241,53,0.06),_transparent_50%)]",
                selectedFile && "border-[#C8F135]/30",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_FORMATS}
                className="hidden"
                onChange={(e) => handleSelectFile(e.target.files?.[0] ?? null)}
              />

              <motion.div
                animate={{
                  y: dragging ? -6 : 0,
                  scale: dragging ? 1.06 : 1,
                }}
                className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/10"
              >
                <Film className="size-7 text-[#C8F135]" />
              </motion.div>

              <h2 className="text-base font-semibold text-white md:text-lg">
                {selectedFile
                  ? selectedFile.name
                  : "Arraste seu vídeo aqui ou clique"}
              </h2>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#8b8b8b]">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · ${selectedFile.type || "vídeo"}`
                  : ".mp4, .mov, .avi e .webm aceitos"}
              </p>

              {selectedFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="mt-4 text-xs text-[#C8F135] underline-offset-2 hover:underline"
                >
                  Trocar vídeo
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-black">
              {previewUrl ? (
                <video
                  key={previewUrl}
                  src={previewUrl}
                  controls
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (v.duration && isFinite(v.duration)) {
                      setVideoDuration(v.duration);
                      // Auto-suggest trim end if user picks trim later
                      setConfig((c) => ({
                        ...c,
                        trimEnd: Math.min(c.trimEnd, Math.floor(v.duration)),
                      }));
                    }
                  }}
                  className="aspect-video h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-center text-xs text-[#5f5f5f]">
                  <Video className="size-7" />
                  <span>Pré-visualização aparecerá aqui</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2 — Presets */}
      <Card className="rounded-3xl border border-border bg-card">
        <CardHeader className="border-b border-border/70 pb-5">
          <CardTitle className="flex items-center gap-3 text-lg text-white">
            <div className="flex size-9 items-center justify-center rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/10 text-sm font-bold text-[#C8F135]">
              2
            </div>
            Escolha as predefinições
            <span className="ml-2 rounded-full border border-border bg-white/5 px-2 py-0.5 text-xs font-normal text-[#8d8d8d]">
              {activePresets.size} ativas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const active = activePresets.has(preset.key);
              return (
                <button
                  key={preset.key}
                  onClick={() => togglePreset(preset.key)}
                  className={cn(
                    "group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "border-[#C8F135]/40 bg-[#C8F135]/10 shadow-[0_0_0_1px_rgba(200,241,53,0.2)]"
                      : "border-border bg-white/[0.02] hover:border-[#C8F135]/20 hover:bg-white/5",
                  )}
                >
                  {preset.badge && (
                    <span className="absolute right-2 top-2 rounded-full border border-[#C8F135]/30 bg-[#C8F135]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#C8F135]">
                      {preset.badge}
                    </span>
                  )}
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl border transition-colors",
                      active
                        ? "border-[#C8F135]/30 bg-[#C8F135]/20 text-[#C8F135]"
                        : "border-border bg-white/5 text-[#a8a8a8] group-hover:text-white",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {preset.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#8d8d8d]">
                      {preset.description}
                    </p>
                  </div>
                  {active && (
                    <div className="absolute right-2 bottom-2 flex size-5 items-center justify-center rounded-full bg-[#C8F135] text-[#111]">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Configurations for active presets */}
          {(activePresets.has("trim") ||
            activePresets.has("speed") ||
            activePresets.has("intro") ||
            activePresets.has("outro") ||
            activePresets.has("music")) && (
            <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-white/[0.02] p-4 md:grid-cols-2">
              {activePresets.has("trim") && (
                <>
                  <div className="space-y-1.5 md:col-span-2">
                    <p className="text-xs text-[#8d8d8d]">
                      Vídeo original:{" "}
                      <span className="text-white font-medium">
                        {videoDuration
                          ? `${videoDuration.toFixed(1)}s`
                          : "duração desconhecida"}
                      </span>
                      {videoDuration && (
                        <span className="text-[#666]">
                          {" "}— o corte vai produzir{" "}
                          <span className="text-[#C8F135]">
                            {Math.max(
                              0,
                              Math.min(config.trimEnd, videoDuration) -
                                Math.max(0, config.trimStart),
                            ).toFixed(1)}
                            s
                          </span>{" "}
                          de vídeo
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8d8d8d]">
                      Início (segundos)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={videoDuration ?? undefined}
                      value={config.trimStart}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          trimStart: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="bg-white/5 border-border text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8d8d8d]">
                      Fim (segundos)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={videoDuration ?? undefined}
                      value={config.trimEnd}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          trimEnd: Math.max(1, Number(e.target.value)),
                        }))
                      }
                      className="bg-white/5 border-border text-white"
                    />
                  </div>
                </>
              )}

              {activePresets.has("speed") && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs text-[#8d8d8d]">
                    Velocidade ({config.speedFactor}x)
                  </Label>
                  <div className="flex gap-2">
                    {[1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setConfig((c) => ({ ...c, speedFactor: s }))
                        }
                        className={cn(
                          "rounded-xl border px-4 py-2 text-sm transition-colors",
                          config.speedFactor === s
                            ? "border-[#C8F135]/40 bg-[#C8F135]/10 text-[#C8F135]"
                            : "border-border bg-white/5 text-[#8d8d8d] hover:text-white",
                        )}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePresets.has("intro") && (
                <div className="space-y-3 md:col-span-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8d8d8d]">
                      Texto da vinheta de entrada
                    </Label>
                    <Input
                      value={config.introTagline}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, introTagline: e.target.value }))
                      }
                      placeholder="Conteúdo que cresce"
                      className="bg-white/5 border-border text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8d8d8d]">
                      Logo da vinheta de entrada (opcional — padrão: CR3SCE)
                    </Label>
                    <input
                      ref={introLogoRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setIntroLogoFile(f);
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => introLogoRef.current?.click()}
                        className={cn(
                          "flex flex-1 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                          introLogoFile
                            ? "border-[#C8F135]/30 bg-[#C8F135]/10"
                            : "border-border bg-white/5 text-[#8d8d8d] hover:border-[#C8F135]/20",
                        )}
                      >
                        {introLogoPreview ? (
                          <img
                            src={introLogoPreview}
                            alt="Logo intro"
                            className="size-10 rounded-md object-contain bg-black/40"
                          />
                        ) : (
                          <ImageIcon className="size-5 text-[#C8F135]" />
                        )}
                        <span className="flex-1 truncate text-white">
                          {introLogoFile
                            ? introLogoFile.name
                            : "Anexar logo do cliente (usa CR3SCE se vazio)"}
                        </span>
                      </button>
                      {introLogoFile && (
                        <button
                          type="button"
                          onClick={() => setIntroLogoFile(null)}
                          className="rounded-lg border border-border bg-white/5 p-2 text-[#8d8d8d] hover:text-white"
                          aria-label="Remover logo"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-[#666]">
                      PNG/JPG/WebP/SVG. Sem logo, usa o emblema CR3SCE.
                    </p>
                  </div>
                </div>
              )}

              {activePresets.has("outro") && (
                <div className="space-y-3 md:col-span-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8d8d8d]">
                      CTA da vinheta de saída
                    </Label>
                    <Input
                      value={config.outroTagline}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, outroTagline: e.target.value }))
                      }
                      placeholder="Siga @cr3sce"
                      className="bg-white/5 border-border text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8d8d8d]">
                      Logo da vinheta de saída (opcional — padrão: CR3SCE)
                    </Label>
                    <input
                      ref={outroLogoRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setOutroLogoFile(f);
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => outroLogoRef.current?.click()}
                        className={cn(
                          "flex flex-1 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                          outroLogoFile
                            ? "border-[#C8F135]/30 bg-[#C8F135]/10"
                            : "border-border bg-white/5 text-[#8d8d8d] hover:border-[#C8F135]/20",
                        )}
                      >
                        {outroLogoPreview ? (
                          <img
                            src={outroLogoPreview}
                            alt="Logo outro"
                            className="size-10 rounded-md object-contain bg-black/40"
                          />
                        ) : (
                          <ImageIcon className="size-5 text-[#C8F135]" />
                        )}
                        <span className="flex-1 truncate text-white">
                          {outroLogoFile
                            ? outroLogoFile.name
                            : "Anexar logo do cliente (usa CR3SCE se vazio)"}
                        </span>
                      </button>
                      {outroLogoFile && (
                        <button
                          type="button"
                          onClick={() => setOutroLogoFile(null)}
                          className="rounded-lg border border-border bg-white/5 p-2 text-[#8d8d8d] hover:text-white"
                          aria-label="Remover logo"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-[#666]">
                      PNG/JPG/WebP/SVG. Sem logo, usa o emblema CR3SCE.
                    </p>
                  </div>
                </div>
              )}

              {activePresets.has("music") && (
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-xs text-[#8d8d8d]">
                    Arquivo de música (.mp3, .wav, .m4a)
                  </Label>
                  <div className="flex flex-col gap-3">
                    <input
                      ref={musicRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setMusicFile(f);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => musicRef.current?.click()}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                        musicFile
                          ? "border-[#C8F135]/30 bg-[#C8F135]/10"
                          : "border-border bg-white/5 text-[#8d8d8d] hover:border-[#C8F135]/20",
                      )}
                    >
                      <Music className="size-4 text-[#C8F135]" />
                      <span className="flex-1 truncate text-white">
                        {musicFile
                          ? musicFile.name
                          : "Clique para anexar uma música"}
                      </span>
                      {musicFile && (
                        <span className="text-xs text-[#8d8d8d]">
                          {(musicFile.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                    </button>

                    {musicFile && (
                      <div className="grid gap-3 rounded-xl border border-border bg-white/[0.02] p-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[#8d8d8d]">
                            Volume da música ({Math.round(config.musicVolume * 100)}%)
                          </Label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={config.musicVolume}
                            onChange={(e) =>
                              setConfig((c) => ({
                                ...c,
                                musicVolume: Number(e.target.value),
                              }))
                            }
                            className="w-full accent-[#C8F135]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[#8d8d8d]">
                            Volume original ({Math.round(config.originalVolume * 100)}%)
                          </Label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={config.originalVolume}
                            onChange={(e) =>
                              setConfig((c) => ({
                                ...c,
                                originalVolume: Number(e.target.value),
                              }))
                            }
                            className="w-full accent-[#C8F135]"
                            disabled={activePresets.has("mute")}
                          />
                          {activePresets.has("mute") && (
                            <p className="text-[10px] text-[#666]">
                              Áudio original silenciado pelo preset Mute
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3 — Optional free-form instruction + submit */}
      <Card className="rounded-3xl border border-border bg-card">
        <CardHeader className="border-b border-border/70 pb-5">
          <CardTitle className="flex items-center gap-3 text-lg text-white">
            <div className="flex size-9 items-center justify-center rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/10 text-sm font-bold text-[#C8F135]">
              3
            </div>
            Instrução em texto (opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-4 md:p-6">
          <p className="text-xs leading-relaxed text-[#8d8d8d]">
            A IA interpreta a sua instrução e adiciona operações que não estão
            cobertas pelas predefinições. Exemplos: "corte do segundo 5 ao 30",
            "acelera 1.5x e adiciona legendas", "deixa em formato Reels com
            fade nas pontas".
          </p>
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Descreva o que você quer fazer com o vídeo..."
            className="min-h-[100px] rounded-2xl border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#555] focus-visible:border-[#C8F135]/40"
          />

          {summaryChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {summaryChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[#C8F135]/30 bg-[#C8F135]/10 px-3 py-1 text-xs text-[#C8F135]"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          <Button
            onClick={() => void submitVideoEdit()}
            disabled={!canSubmit}
            className="h-14 gap-2 rounded-2xl bg-[#C8F135] text-base font-semibold text-[#111] hover:bg-[#b5da2d] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Editando agora...
              </>
            ) : (
              <>
                <Send className="size-5" />
                Editar vídeo
              </>
            )}
          </Button>

          {!selectedFile && (
            <p className="text-center text-xs text-[#8d8d8d]">
              Anexe um vídeo para começar
            </p>
          )}
          {selectedFile && !hasAnyAction && (
            <p className="text-center text-xs text-[#8d8d8d]">
              Selecione pelo menos uma predefinição ou escreva uma instrução
            </p>
          )}
        </CardContent>
      </Card>

      {/* Processing overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(200,241,53,0.16),_rgba(0,0,0,0.82)_42%)] p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-2xl rounded-[32px] border border-[#C8F135]/15 bg-[#111111] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] md:p-8"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-3xl border border-[#C8F135]/20 bg-[#C8F135]/10">
                  <Scissors className="size-7 text-[#C8F135]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#C8F135]">
                    CR3SCE Video Studio
                  </p>
                  <h3 className="text-2xl font-semibold text-white">
                    Processando sua edição
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {PROCESSING_STEPS.map((step, index) => (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                      index === processingStep
                        ? "border-[#C8F135]/20 bg-[#C8F135]/10 text-white"
                        : index < processingStep
                          ? "border-border bg-white/5 text-[#c6c6c6]"
                          : "border-border/70 bg-white/[0.03] text-[#686868]",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        index <= processingStep ? "bg-[#C8F135]" : "bg-[#3f3f3f]",
                      )}
                    />
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-xs text-[#8a8a8a]">
                  <span>Progresso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-white/10" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      {result && (
        <Card className="rounded-3xl border border-border bg-card">
          <CardHeader className="border-b border-border/70 pb-5">
            <CardTitle className="flex items-center gap-3 text-lg text-white">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/10">
                <Clapperboard className="size-5 text-[#C8F135]" />
              </div>
              Vídeo pronto
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-4 md:p-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[28px] border border-border bg-black">
              <video
                key={result.previewUrl}
                controls
                className="aspect-video w-full"
                src={result.previewUrl}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C8F135]">
                  Resultado
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white">
                  {result.summary}
                </p>
              </div>

              {result.operations.length > 0 && (
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#666]">
                    Operações aplicadas
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.operations.map((operation, i) => (
                      <span
                        key={`${result.jobId}-${i}`}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-[#c6c6c6]"
                      >
                        {operation.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
                    Avisos
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {result.warnings.map((warning, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-[#9d9d9d]"
                      >
                        {warning}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <a href={result.downloadUrl} download className="w-full">
                <Button className="h-12 w-full gap-2 rounded-2xl bg-[#C8F135] text-base font-semibold text-[#111] hover:bg-[#b5da2d]">
                  <Download className="size-4" />
                  Baixar vídeo editado
                </Button>
              </a>

              <Button
                variant="outline"
                onClick={() => void submitVideoEdit()}
                disabled={!selectedFile || !hasAnyAction || quota.reached || isSubmitting}
                className="h-12 gap-2 rounded-2xl border-border bg-white/5 text-white hover:bg-white/10"
              >
                <RefreshCcw className="size-4" />
                Refazer edição
              </Button>

              <p className="text-xs leading-relaxed text-[#727272]">
                O refazer conta como nova edição. Arquivos ficam salvos por 24h.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
