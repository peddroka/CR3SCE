"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clapperboard,
  Download,
  Film,
  Loader2,
  RefreshCcw,
  Scissors,
  Send,
  Sparkles,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const EXAMPLE_CHIPS = [
  "Adicionar legendas automáticas",
  "Cortar do início até 30 segundos",
  "Adicionar vinheta de entrada e saída",
  "Melhorar qualidade da imagem",
];

const ACCEPTED_FORMATS = ".mp4,.mov,.avi,.webm";
const PROCESSING_STEPS = [
  "Recebendo seu vídeo...",
  "Entendendo o que você quer...",
  "Editando com carinho...",
  "Quase pronto!",
];

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const canSubmit = selectedFile && instruction.trim() && !isSubmitting && !hasReachedLimit;

  useEffect(() => {
    void loadQuota();
  }, [userId]);

  useEffect(() => {
    if (!isSubmitting) return;

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        return Math.min(current + 8, 92);
      });

      setProcessingStep((current) => {
        if (current >= PROCESSING_STEPS.length - 1) return current;
        return current + 1;
      });
    }, 1300);

    return () => window.clearInterval(interval);
  }, [isSubmitting]);

  const activityItems = useMemo(() => {
    const items: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
    }> = [];

    if (instruction.trim()) {
      items.push({
        id: "user",
        role: "user",
        content: instruction.trim(),
      });
    }

    if (result?.summary) {
      items.push({
        id: "assistant",
        role: "assistant",
        content: result.summary,
      });
    }

    return items;
  }, [instruction, result]);

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

  function handleSelectFile(file: File | null) {
    if (!file) return;

    const valid =
      file.type === "video/mp4" ||
      file.type === "video/quicktime" ||
      file.type === "video/x-msvideo" ||
      file.type === "video/webm";

    if (!valid) {
      setError("Formato invalido. Use .mp4, .mov, .avi ou .webm.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResult(null);
  }

  function onDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    handleSelectFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function submitVideoEdit() {
    if (!selectedFile || !instruction.trim() || isSubmitting || hasReachedLimit) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setProcessingStep(0);
    setProgress(12);
    triggerStartParticles();

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("instruction", instruction.trim());

    try {
      const response = await fetch("/api/video-editor", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setQuota(payload.quota || quota);
        throw new Error(payload.error || "Nao foi possivel editar o video agora.");
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
          : "Nao foi possivel editar o video agora.",
      );
    } finally {
      window.setTimeout(() => {
        setIsSubmitting(false);
      }, 250);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10 px-3 py-1 text-xs font-medium text-[#C8F135]">
            <Clapperboard className="size-3.5" />
            Novo studio de edição para {businessName}
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Editar Vídeo
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8d8d8d] md:text-base">
            Envie um video, descreva o resultado que voce quer e acompanhe tudo
            com preview, download e contador diario sempre visivel.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5f5f5f]">
            Limite diario
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            Você usou {quota.used} de {quota.limit} edições hoje
          </p>
          <p className="mt-1 text-xs text-[#777]">
            {hasReachedLimit
              ? "Você já editou 5 vídeos hoje! Seus créditos renovam à meia-noite. 🎬"
              : `${quota.remaining} edições restantes hoje`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden rounded-3xl border border-border bg-card">
          <CardHeader className="border-b border-border/70 pb-5">
            <CardTitle className="flex items-center gap-3 text-lg text-white">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/10">
                <Video className="size-5 text-[#C8F135]" />
              </div>
              Área superior — Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "relative flex min-h-[340px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-10 text-center transition-all md:min-h-[400px]",
                dragging
                  ? "border-[#C8F135] bg-[#C8F135]/10 shadow-[0_0_0_1px_rgba(200,241,53,0.25)]"
                  : "border-border bg-[radial-gradient(circle_at_top,_rgba(200,241,53,0.08),_transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_FORMATS}
                className="hidden"
                onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)}
              />

              <motion.div
                animate={{
                  y: dragging ? -6 : 0,
                  scale: dragging ? 1.06 : 1,
                }}
                className="mb-5 flex size-20 items-center justify-center rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10"
              >
                <Film className="size-9 text-[#C8F135]" />
              </motion.div>

              <h2 className="max-w-lg text-xl font-semibold text-white md:text-2xl">
                Arraste seu vídeo aqui ou clique para anexar
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#8b8b8b]">
                Aceita .mp4, .mov, .avi e .webm. Apenas 1 vídeo por vez.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-[#8b8b8b]">
                <span className="rounded-full border border-border bg-white/5 px-3 py-1.5">
                  Você usou {quota.used} de 5 edições hoje
                </span>
                <span className="rounded-full border border-border bg-white/5 px-3 py-1.5">
                  Upload unico por envio
                </span>
              </div>

              {selectedFile && (
                <div className="mt-8 w-full max-w-xl rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C8F135]">
                    Vídeo selecionado
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-white">
                    {selectedFile.name}
                  </p>
                  <p className="mt-1 text-xs text-[#7a7a7a]">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </button>

            {error && (
              <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card">
          <CardHeader className="border-b border-border/70 pb-5">
            <CardTitle className="flex items-center gap-3 text-lg text-white">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/10">
                <Sparkles className="size-5 text-[#C8F135]" />
              </div>
              Área inferior — Chat de instrução
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4 md:p-6">
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f5f5f]">
                Historico rapido
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {activityItems.length === 0 && (
                  <div className="rounded-2xl border border-border bg-white/5 px-4 py-3 text-sm text-[#8a8a8a]">
                    Envie seu primeiro pedido para a IA entender como você quer o
                    resultado final.
                  </div>
                )}

                {activityItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex",
                      item.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        item.role === "user"
                          ? "border border-[#C8F135]/20 bg-[#C8F135]/10 text-[#ebebeb]"
                          : "border border-border bg-white/5 text-[#bfbfbf]",
                      )}
                    >
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Textarea
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="Descreva como você quer o vídeo editado..."
              className="min-h-[150px] rounded-2xl border-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#555] focus-visible:border-[#C8F135]/40"
            />

            <div className="flex flex-wrap gap-2">
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() =>
                    setInstruction((current) =>
                      current.trim() ? `${current.trim()}. ${chip}` : chip,
                    )
                  }
                  className="rounded-full border border-border bg-white/5 px-3 py-2 text-xs text-[#b5b5b5] transition-colors hover:border-[#C8F135]/30 hover:bg-[#C8F135]/10 hover:text-white"
                >
                  {chip}
                </button>
              ))}
            </div>

            <Button
              onClick={() => void submitVideoEdit()}
              disabled={!canSubmit}
              className="h-12 gap-2 rounded-2xl bg-[#C8F135] text-base font-semibold text-[#111] hover:bg-[#b5da2d] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Editando agora
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Editar agora
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

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
                  <span>Barra de progresso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-white/10" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <Card className="rounded-3xl border border-border bg-card">
          <CardHeader className="border-b border-border/70 pb-5">
            <CardTitle className="flex items-center gap-3 text-lg text-white">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/10">
                <Clapperboard className="size-5 text-[#C8F135]" />
              </div>
              Entrega do vídeo
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
                    Operacoes identificadas
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.operations.map((operation) => (
                      <span
                        key={`${result.jobId}-${operation.label}`}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-[#c6c6c6]"
                      >
                        {operation.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#666]">
                    Avisos do processamento
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {result.warnings.map((warning) => (
                      <p key={warning} className="text-sm leading-relaxed text-[#9d9d9d]">
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
                disabled={!selectedFile || !instruction.trim() || quota.reached || isSubmitting}
                className="h-12 gap-2 rounded-2xl border-border bg-white/5 text-white hover:bg-white/10"
              >
                <RefreshCcw className="size-4" />
                Não gostei, quero refazer
              </Button>

              <p className="text-xs leading-relaxed text-[#727272]">
                O refazer conta como uma nova edição. Os arquivos ficam salvos
                temporariamente por 24h no servidor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
