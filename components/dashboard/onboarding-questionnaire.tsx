"use client";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useEffect, useRef } from "react";
import { createClient, getUserSafely } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Rocket,
  Zap,
  Target,
  Instagram,
  User,
  Loader2,
  Wand2,
  X,
  Lightbulb,
  Mic,
  Upload,
  Camera,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_STEPS = 4;
const DRAFT_KEY_PREFIX = "cr3sce_onboarding_draft";
const LEGACY_DRAFT_KEY = DRAFT_KEY_PREFIX;

const GOAL_OPTIONS = [
  {
    value: "visualizacao",
    label: "Aumentar visualização",
    description:
      "Conteúdo mais viral e mais aberto para alcance. Você ganha mais descoberta, mas fala com um público menos filtrado.",
  },
  {
    value: "identidade",
    label: "Construir identidade",
    description:
      "Conteúdo mais direcionado para quem realmente se interessa pelo seu nicho. Tende a gerar menos volume e mais intenção de compra.",
  },
] as const;

const GROWTH_OPTIONS = [
  {
    value: "moderado",
    label: "Moderado",
    description:
      "Todos os dias com pelo menos 3 Stories e 1 post no feed. Reels entram 2 a 3 vezes por semana.",
  },
  {
    value: "rapido",
    label: "Explosivo",
    description:
      "6 Stories por dia, 1 post no feed por dia, 1 Reels por dia, lives em dias estratégicos e Reels viral no fim de semana.",
  },
] as const;

const COMMUNICATION_STYLE_OPTIONS = [
  {
    value: "humoristico",
    label: "Humorístico",
    description:
      "Tom leve, rápido e divertido. A IA vai puxar mais ganchos engraçados e cenas espontâneas.",
  },
  {
    value: "educativo",
    label: "Educativo",
    description:
      "Tom de especialista. A IA vai priorizar explicações claras, provas e ensinamentos práticos.",
  },
  {
    value: "casual",
    label: "Casual",
    description:
      "Tom natural e próximo. A IA vai escrever como uma conversa direta com o cliente.",
  },
] as const;

function getDraftKey(userId?: string | null) {
  return userId ? `${DRAFT_KEY_PREFIX}_${userId}` : `${DRAFT_KEY_PREFIX}_guest`;
}

interface FormData {
  business_name: string;
  niche: string;
  target_audience: string;
  main_goal: string;
  platforms: string;
  communication_style: string;
  growth_speed: string;
  brand_description: string;
  responsible_name: string;
  instagram_handle: string;
  instagram_type: "normal" | "profissional" | "";
}

const defaultForm: FormData = {
  business_name: "",
  niche: "",
  target_audience: "",
  main_goal: "",
  platforms: "instagram",
  communication_style: "",
  growth_speed: "",
  brand_description: "",
  responsible_name: "",
  instagram_handle: "",
  instagram_type: "",
};

export function OnboardingQuestionnaire() {
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    field: string;
    suggestion: string;
    improved: string;
  } | null>(null);
  const [validationAttempts, setValidationAttempts] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [bioImages, setBioImages] = useState<File[]>([]);
  const [bioImagePreviews, setBioImagePreviews] = useState<string[]>([]);
  const [showInstagramGuide, setShowInstagramGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(defaultForm);

  useEffect(() => {
    let cancelled = false;

    const bootstrapDraft = async () => {
      if (typeof window === "undefined") return;

      try {
        window.localStorage.removeItem(LEGACY_DRAFT_KEY);
      } catch {}

      let nextDraftKey = getDraftKey(null);

      try {
        const { user } = await getUserSafely(supabase);
        nextDraftKey = getDraftKey(user?.id);
      } catch {}

      if (cancelled) return;
      setDraftKey(nextDraftKey);

      try {
        const saved = window.localStorage.getItem(nextDraftKey);

        if (!saved) {
          setFormData(defaultForm);
          return;
        }

        const parsed = JSON.parse(saved) as Partial<FormData>;

        setFormData({
          ...defaultForm,
          ...parsed,
          platforms: "instagram",
        });
      } catch {
        setFormData(defaultForm);
      } finally {
        if (!cancelled) setDraftReady(true);
      }
    };

    void bootstrapDraft();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftReady || !draftKey) return;
    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          ...formData,
          platforms: formData.platforms || "instagram",
        }),
      );
    } catch {}
  }, [draftKey, draftReady, formData]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: false }));
    }
    if (aiSuggestion?.field === field) {
      setAiSuggestion(null);
      setValidationAttempts(0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBioImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setBioImages((prev) => [...prev, ...files]);

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setBioImages((prev) => prev.filter((_, i) => i !== index));
    setBioImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (stepNumber: number): boolean => {
    const errors: Record<string, boolean> = {};

    if (stepNumber === 1) {
      if (!formData.business_name.trim()) errors.business_name = true;
      if (!formData.niche.trim()) errors.niche = true;
      if (!formData.target_audience.trim()) errors.target_audience = true;
      if (!formData.responsible_name.trim()) errors.responsible_name = true;
    } else if (stepNumber === 2) {
      if (!formData.main_goal) errors.main_goal = true;
      if (!formData.growth_speed) errors.growth_speed = true;
    } else if (stepNumber === 3) {
      if (!formData.communication_style) errors.communication_style = true;
      if (!formData.brand_description.trim()) errors.brand_description = true;
    } else if (stepNumber === 4 && formData.platforms === "instagram") {
      if (!formData.instagram_type) errors.instagram_type = true;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      window.alert("Navegador não suporta voz. Use Chrome ou Edge.");
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((x: any) => x[0].transcript)
        .join("");
      updateField("brand_description", transcript);
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const generateTargetAudience = async () => {
    if (!formData.business_name || !formData.niche) {
      setError("Preencha o nome do negócio e nicho primeiro");
      return;
    }

    setIsGeneratingAudience(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: formData.business_name,
          niche: formData.niche,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAiSuggestion({
        field: "target_audience",
        suggestion: "Sugestão gerada pela IA:",
        improved: data.audience,
      });
      setValidationAttempts(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingAudience(false);
    }
  };

  const applySuggestion = () => {
    if (!aiSuggestion) return;

    updateField(aiSuggestion.field as keyof FormData, aiSuggestion.improved);
    setAiSuggestion(null);
    setValidationAttempts(0);

    window.setTimeout(() => {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setError(null);
    setAiSuggestion(null);
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user } = await getUserSafely(supabase);
      if (!user) throw new Error("Não autenticado");

      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        if (typeof window !== "undefined" && draftKey) {
          try {
            window.localStorage.removeItem(draftKey);
          } catch {}
        }
        window.location.href = "/dashboard";
        return;
      }

      const bioUrls: string[] = [];

      for (const bioImage of bioImages) {
        const fileExt = bioImage.name.split(".").pop();
        const filePath = `bio-screenshots/${user.id}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, bioImage, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("profile-images")
            .getPublicUrl(filePath);
          bioUrls.push(urlData.publicUrl);
        }
      }

      const { error: insertError } = await supabase.from("businesses").insert({
        user_id: user.id,
        business_name: formData.business_name,
        niche: formData.niche,
        target_audience: formData.target_audience,
        main_goal: formData.main_goal,
        platforms: formData.platforms || "instagram",
        communication_style: formData.communication_style,
        growth_speed: formData.growth_speed,
        brand_description: formData.brand_description,
        responsible_name: formData.responsible_name,
        instagram_handle: formData.instagram_handle.replace("@", "") || null,
        instagram_type: formData.instagram_type || null,
        brand_colors: [],
        logo_url: null,
        bio_screenshot_url: bioUrls[0] || null,
        bio_screenshots: bioUrls.length > 0 ? bioUrls : null,
        onboarding_complete: true,
      });

      if (insertError) throw insertError;

      if (typeof window !== "undefined" && draftKey) {
        try {
          window.localStorage.removeItem(draftKey);
        } catch {}
      }

      const now = new Date();
      const strategyRequests = [
        {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      ];

      if (now.getDate() > 1) {
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        strategyRequests.push({
          month: nextMonthDate.getMonth() + 1,
          year: nextMonthDate.getFullYear(),
        });
      }

      setIsComplete(true);
      setIsLoading(false);

      strategyRequests.forEach((payload) => {
        void fetch("/api/strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        })
          .then(async (response) => {
            if (response.ok) return;

            const data = (await response.json().catch(() => null)) as
              | { error?: string }
              | null;
            console.error(
              "Erro ao gerar estratégia inicial:",
              data?.error || response.statusText,
            );
          })
          .catch((generationError) => {
            console.error("Erro ao gerar estratégia inicial:", generationError);
          });
      });

      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar dados.");
      setIsLoading(false);
    }
  };

  const guideSteps = [
    {
      title: "Abra o Instagram",
      description:
        "Acesse o Instagram no seu celular e vá para o seu perfil clicando na sua foto no canto inferior direito.",
      image: "1",
    },
    {
      title: "Visualize sua Bio",
      description:
        "Você verá seu nome, bio, número de seguidores e posts. Esta é a tela que precisamos. Tire um print desta tela inteira.",
      image: "2",
    },
    {
      title: "Tire o print",
      description:
        "No iPhone: pressione o botão lateral + volume. No Android: pressione power + volume abaixo ao mesmo tempo.",
      image: "3",
    },
    {
      title: "Volte e envie",
      description:
        "Volte para esta página - seus dados estão salvos. Clique em 'Adicionar print' e selecione a foto que acabou de tirar.",
      image: "4",
    },
  ];

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[#0a0a0a]">
        <div className="flex select-none items-center gap-0">
          {["C", "R", "3", "S", "C", "E"].map((letter, i) => (
            <motion.span
              key={i}
              style={{
                fontFamily: "'Arial Black', sans-serif",
                fontSize: "80px",
                fontWeight: 900,
                lineHeight: 1,
                color: letter === "3" ? "#C8F135" : "#ffffff",
                display: "inline-block",
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.15,
                duration: 0.4,
                type: "spring",
                stiffness: 200,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="size-2 rounded-full bg-[#C8F135]"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.25,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-[#888]">
            Criando sua estratégia personalizada...
          </p>
        </motion.div>
      </div>
    );
  }

  const hasError = (field: keyof FormData) => validationErrors[field];

  return (
    <div className="relative flex min-h-screen w-full items-start justify-center overflow-y-auto bg-gradient-to-br from-primary/20 via-background to-background p-3 pb-24 pt-16">
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        />
      </div>
      <AnimatePresence>
        {showInstagramGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setShowInstagramGuide(false);
                setGuideStep(0);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 z-[201] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 bg-border">
                <div
                  className="h-full bg-[#C8F135] transition-all duration-300"
                  style={{
                    width: `${((guideStep + 1) / guideSteps.length) * 100}%`,
                  }}
                />
              </div>
              <div className="p-6">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/10 text-4xl text-[#C8F135]">
                  {guideSteps[guideStep].image}
                </div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                  {guideStep + 1} / {guideSteps.length}
                </p>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {guideSteps[guideStep].title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#888]">
                  {guideSteps[guideStep].description}
                </p>
                <div className="flex gap-2">
                  {guideStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGuideStep((g) => g - 1)}
                      className="border-border bg-white/5 text-[#888]"
                    >
                      Voltar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1 bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020]"
                    onClick={() => {
                      if (guideStep < guideSteps.length - 1) {
                        setGuideStep((g) => g + 1);
                        return;
                      }
                      setShowInstagramGuide(false);
                      setGuideStep(0);
                      fileInputRef.current?.click();
                    }}
                  >
                    {guideStep < guideSteps.length - 1
                      ? "Próximo"
                      : "Adicionar print"}
                    <ChevronRight className="ml-1 size-3.5" />
                  </Button>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInstagramGuide(false);
                  setGuideStep(0);
                }}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[#555] hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="overflow-visible rounded-md border-2 border-primary/20 bg-card/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="px-4 pb-2 pt-6 text-center">
            <div className="relative mx-auto mb-2 flex items-center justify-center">
              {step === 1 && (
                <Rocket className="size-12 text-[#C8F135] sm:size-14" />
              )}
              {step === 2 && (
                <Target className="size-12 text-[#C8F135] sm:size-14" />
              )}
              {step === 3 && (
                <Zap className="size-12 text-[#C8F135] sm:size-14" />
              )}
              {step === 4 && (
                <Instagram className="size-12 text-[#C8F135] sm:size-14" />
              )}
            </div>
            <CardTitle className="text-xl font-bold text-foreground sm:text-2xl">
              {step === 1 && "Vamos decolar!"}
              {step === 2 && "Defina sua estratégia"}
              {step === 3 && "Seu objetivo no CR3SCE"}
              {step === 4 && "Seu perfil do Instagram"}
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Passo {step} de {TOTAL_STEPS}
            </CardDescription>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <motion.div
                  key={i}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-secondary"
                >
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: i < step ? "100%" : "0%" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                </motion.div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                {step === 1 && (
                  <>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="business_name"
                        className="text-sm font-medium"
                      >
                        Nome do negócio *
                      </Label>
                      <Input
                        id="business_name"
                        placeholder="Ex: Padaria do João"
                        value={formData.business_name}
                        onChange={(e) =>
                          updateField("business_name", e.target.value)
                        }
                        className={`h-10 rounded-md text-sm ${
                          hasError("business_name") ? "border-destructive" : ""
                        }`}
                        autoFocus
                      />
                      {hasError("business_name") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="responsible_name"
                        className="flex items-center gap-1 text-sm font-medium"
                      >
                        <User className="size-3" /> Seu nome *
                      </Label>
                      <Input
                        id="responsible_name"
                        placeholder="Ex: João Silva"
                        value={formData.responsible_name}
                        onChange={(e) =>
                          updateField("responsible_name", e.target.value)
                        }
                        className={`h-10 rounded-md text-sm ${
                          hasError("responsible_name")
                            ? "border-destructive"
                            : ""
                        }`}
                      />
                      {hasError("responsible_name") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="niche" className="text-sm font-medium">
                        Nicho / segmento *
                      </Label>
                      <Input
                        id="niche"
                        placeholder="Ex: Padaria artesanal"
                        value={formData.niche}
                        onChange={(e) => updateField("niche", e.target.value)}
                        className={`h-10 rounded-md text-sm ${
                          hasError("niche") ? "border-destructive" : ""
                        }`}
                      />
                      {hasError("niche") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                      <div className="mt-1 flex items-start gap-1">
                        <Lightbulb className="mt-0.5 size-3 shrink-0 text-primary" />
                        <p className="text-xs text-muted-foreground">
                          Quanto mais específico, melhor
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="target_audience"
                        className="text-sm font-medium"
                      >
                        Público-alvo *
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="target_audience"
                          placeholder="Ex: Mulheres de 25-40 anos, classe média"
                          value={formData.target_audience}
                          onChange={(e) =>
                            updateField("target_audience", e.target.value)
                          }
                          rows={3}
                          className={`min-h-[80px] resize-none rounded-md pr-12 text-sm ${
                            hasError("target_audience")
                              ? "border-destructive"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={generateTargetAudience}
                          disabled={
                            isGeneratingAudience ||
                            !formData.business_name ||
                            !formData.niche
                          }
                          className="absolute right-3 top-3 rounded-full bg-[#C8F135] p-2 text-[#111] shadow-md disabled:opacity-50"
                        >
                          {isGeneratingAudience ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Wand2 className="size-4" />
                          )}
                        </button>
                      </div>
                      {hasError("target_audience") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Objetivo principal *
                      </Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {GOAL_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField("main_goal", option.value)}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${
                              formData.main_goal === option.value
                                ? "border-[#C8F135] bg-[#C8F135]/10"
                                : "border-border bg-white/5 hover:border-[#C8F135]/40"
                            } ${
                              hasError("main_goal") ? "border-destructive" : ""
                            }`}
                          >
                            <p className="text-sm font-semibold text-white">
                              {option.label}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-[#888]">
                              {option.description}
                            </p>
                          </button>
                        ))}
                      </div>
                      {hasError("main_goal") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}

                      {formData.main_goal && (
                        <div className="rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4">
                          <p className="mb-1 text-sm font-medium text-[#C8F135]">
                            O que isso muda na sua estratégia?
                          </p>
                          <p className="text-xs leading-relaxed text-[#888]">
                            {formData.main_goal === "visualizacao"
                              ? "Seu calendário vai priorizar alcance, ganchos fortes, temas mais compartilháveis e conteúdos com pegada mais viral. A descoberta tende a subir, mas o público fica menos filtrado."
                              : "Seu calendário vai priorizar autoridade, clareza de posicionamento, diferenciação e conteúdos feitos para atrair pessoas realmente interessadas no seu nicho. O alcance pode ser menor, mas a tendência é gerar mais conversas e vendas qualificadas."}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Plataforma</Label>
                      <div className="rounded-xl border border-border bg-white/5 px-4 py-3">
                        <p className="text-sm font-semibold text-white">
                          Instagram
                        </p>
                        <p className="mt-1 text-xs text-[#888]">
                          Por enquanto esta etapa fica fixa no Instagram para manter a estratégia mais consistente.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Velocidade de crescimento *
                      </Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {GROWTH_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateField("growth_speed", option.value)
                            }
                            className={`rounded-xl border-2 p-4 text-left transition-all ${
                              formData.growth_speed === option.value
                                ? "border-[#C8F135] bg-[#C8F135]/10"
                                : "border-border bg-white/5 hover:border-[#C8F135]/40"
                            } ${
                              hasError("growth_speed")
                                ? "border-destructive"
                                : ""
                            }`}
                          >
                            <p className="text-sm font-semibold text-white">
                              {option.label}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-[#888]">
                              {option.description}
                            </p>
                          </button>
                        ))}
                      </div>
                      {hasError("growth_speed") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Estilo de comunicação *
                      </Label>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {COMMUNICATION_STYLE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateField("communication_style", option.value)
                            }
                            className={`rounded-xl border-2 p-4 text-left transition-all ${
                              formData.communication_style === option.value
                                ? "border-[#C8F135] bg-[#C8F135]/10"
                                : "border-border bg-white/5 hover:border-[#C8F135]/40"
                            } ${
                              hasError("communication_style")
                                ? "border-destructive"
                                : ""
                            }`}
                          >
                            <p className="text-sm font-semibold text-white">
                              {option.label}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-[#888]">
                              {option.description}
                            </p>
                          </button>
                        ))}
                      </div>
                      {hasError("communication_style") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}

                      {formData.communication_style && (
                        <div className="rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4">
                          <p className="mb-1 text-sm font-medium text-[#C8F135]">
                            Como a IA vai usar isso
                          </p>
                          <p className="text-xs leading-relaxed text-[#888]">
                            {formData.communication_style === "humoristico" &&
                              "A IA vai puxar roteiros mais leves, com ganchos engraçados, linguagem solta e cortes que parecem naturais."}
                            {formData.communication_style === "educativo" &&
                              "A IA vai escrever como especialista, com explicações objetivas, provas e conteúdos que ensinam algo útil."}
                            {formData.communication_style === "casual" &&
                              "A IA vai falar como conversa do dia a dia: direta, humana e fácil de entender, sem ficar formal demais."}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        O que você quer conquistar usando o CR3SCE? *
                      </Label>
                      <p className="text-xs leading-relaxed text-[#888]">
                        Exemplos: ganhar mais seguidores, vender mais, aumentar
                        visualizações, lançar um produto, viralizar ou educar
                        sua audiência.
                      </p>
                      <div className="relative">
                        <Textarea
                          placeholder="Explique com suas palavras o que você quer conquistar. Quanto mais contexto você der, mais estratégico o calendário fica."
                          value={formData.brand_description}
                          onChange={(e) =>
                            updateField("brand_description", e.target.value)
                          }
                          rows={3}
                          className={`min-h-[80px] resize-none rounded-md pr-12 text-sm ${
                            hasError("brand_description")
                              ? "border-destructive"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={startListening}
                          className={`absolute right-3 top-3 rounded-full p-2 transition-all ${
                            isListening
                              ? "animate-pulse bg-red-500 text-white"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                        >
                          <Mic className="size-4" />
                        </button>
                      </div>
                      {isListening && (
                        <p className="animate-pulse text-xs text-red-400">
                          Ouvindo... Fale agora
                        </p>
                      )}
                      <p className="text-xs leading-relaxed text-[#666]">
                        Dica: ative o microfone e fale. Quanto mais você
                        explicar, melhor o CR3SCE vai trabalhar pra você.
                      </p>
                      {hasError("brand_description") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4">
                      <p className="mb-1 text-sm font-medium text-[#C8F135]">
                        Por que pedimos isso?
                      </p>
                      <p className="text-xs leading-relaxed text-[#888]">
                        A nossa IA vai analisar nome, nome de pesquisa, bio,
                        foto ou logomarca, link de contato, quantidade de posts
                        e clareza do perfil para o seu nicho. Se a conta for
                        profissional, ela também analisa as métricas do painel.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Seu Instagram é normal ou profissional?
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            value: "normal",
                            label: "Normal",
                            desc: "Conta pessoal comum",
                          },
                          {
                            value: "profissional",
                            label: "Profissional",
                            desc: "Conta comercial ou criador",
                          },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              updateField(
                                "instagram_type",
                                opt.value as FormData["instagram_type"],
                              )
                            }
                            className={`rounded-xl border-2 p-3 text-left transition-all ${
                              formData.instagram_type === opt.value
                                ? "border-[#C8F135] bg-[#C8F135]/10"
                                : "border-border bg-white/5 hover:border-[#C8F135]/40"
                            }`}
                          >
                            <p className="text-sm font-medium text-white">
                              {opt.label}
                            </p>
                            <p className="text-xs text-[#888]">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                      {hasError("instagram_type") && (
                        <p className="text-xs text-destructive">
                          Escolha o tipo da sua conta
                        </p>
                      )}
                    </div>

                    {formData.instagram_type === "profissional" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
                      >
                        <p className="text-sm font-medium text-blue-400">
                          Conta profissional detectada
                        </p>
                        <p className="text-xs leading-relaxed text-[#888]">
                          Envie dois prints: um da sua bio (perfil) e um do
                          Painel Profissional (clique em "Ver insights" no seu
                          perfil). Isso nos permite analisar suas métricas de
                          alcance e engajamento também.
                        </p>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Print da sua bio{" "}
                        {formData.instagram_type === "profissional"
                          ? "(bio + painel)"
                          : ""}{" "}
                        (opcional, mas recomendado)
                      </Label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {bioImagePreviews.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {bioImagePreviews.map((preview, idx) => (
                            <div
                              key={idx}
                              className="relative overflow-hidden rounded-xl border border-[#C8F135]/30"
                            >
                              <img
                                src={preview}
                                alt={`Print ${idx + 1}`}
                                className="w-full max-h-64 object-cover"
                              />
                              <button
                                onClick={() => removeImage(idx)}
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                              >
                                <X className="size-3.5" />
                              </button>
                              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[#C8F135] px-2 py-1">
                                <CheckCircle2 className="size-3 text-[#111]" />
                                <span className="text-[10px] font-bold text-[#111]">
                                  {idx === 0 ? "Bio" : "Painel profissional"}
                                </span>
                              </div>
                            </div>
                          ))}
                          {formData.instagram_type === "profissional" &&
                            bioImagePreviews.length < 2 && (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#C8F135]/30 bg-[#C8F135]/5 p-3 text-sm text-[#888] transition-all hover:bg-[#C8F135]/10 hover:text-white"
                              >
                                <Upload className="size-4" />
                                Adicionar print do painel profissional
                              </button>
                            )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setGuideStep(0);
                              setShowInstagramGuide(true);
                            }}
                            className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#C8F135]/30 bg-[#C8F135]/5 p-6 transition-all hover:border-[#C8F135]/60 hover:bg-[#C8F135]/10"
                          >
                            <Camera className="size-6 text-[#C8F135]" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-white">
                                Como tirar e adicionar o print
                              </p>
                              <p className="text-xs text-[#888]">
                                Clique para ver o passo a passo
                              </p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white/5 p-3 text-sm text-[#888] transition-all hover:bg-white/10 hover:text-white"
                          >
                            <Upload className="size-4" />
                            Já tenho o print, quero adicionar direto
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="instagram_handle"
                        className="flex items-center gap-1 text-sm font-medium"
                      >
                        <Instagram className="size-3" /> @ do Instagram
                        (opcional)
                      </Label>
                      <Input
                        id="instagram_handle"
                        placeholder="@seudominio"
                        value={formData.instagram_handle}
                        onChange={(e) =>
                          updateField("instagram_handle", e.target.value)
                        }
                        className="h-10 rounded-md text-sm"
                      />
                    </div>

                  </>
                )}

                {aiSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border-2 border-primary/30 bg-primary/10 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/20 p-2">
                        <Wand2 className="size-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-2 text-sm font-medium text-primary">
                          {aiSuggestion.suggestion}
                        </p>
                        {aiSuggestion.improved && (
                          <div className="mb-3 rounded-lg border border-primary/20 bg-background/50 p-3">
                            <p className="whitespace-pre-wrap text-sm">
                              {aiSuggestion.improved}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {aiSuggestion.improved && (
                            <Button
                              size="sm"
                              onClick={applySuggestion}
                              className="gap-1 bg-primary hover:bg-primary/90"
                            >
                              <Sparkles className="size-3" /> Usar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAiSuggestion(null);
                              if (validationAttempts >= 1) {
                                setStep((prev) => prev + 1);
                              }
                            }}
                            className="gap-1"
                          >
                            <X className="size-3" /> Manter meu texto
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-md bg-destructive/10 p-2 text-xs text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="mt-1 flex items-center justify-between border-t border-primary/10 pt-3">
                  {step > 1 ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep((prev) => prev - 1);
                        setAiSuggestion(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      size="sm"
                      className="h-9 gap-1 rounded-md px-3 text-xs"
                    >
                      <ArrowLeft className="size-3" /> Voltar
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < TOTAL_STEPS ? (
                    <Button
                      onClick={handleNext}
                      size="sm"
                      className="h-9 gap-1 rounded-md bg-primary px-4 text-xs hover:bg-primary/90"
                    >
                      Próximo <ArrowRight className="size-3" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      size="sm"
                      className="h-9 gap-1 rounded-md bg-primary px-4 text-xs hover:bg-primary/90"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />{" "}
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3" /> Finalizar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
        <div className="h-4" />
      </motion.div>
    </div>
  );
}
