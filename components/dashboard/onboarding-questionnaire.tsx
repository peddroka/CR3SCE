"use client";

// Declaração de tipos para SpeechRecognition (API de voz)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
  CheckCircle2,
  Rocket,
  Zap,
  Target,
  Instagram,
  User,
  AlertCircle,
  Loader2,
  Wand2,
  X,
  Lightbulb,
  Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const TOTAL_STEPS = 4;

interface FormData {
  business_name: string;
  niche: string;
  target_audience: string;
  main_goal: string;
  platforms: string;
  communication_style: string;
  growth_speed: string;
  brand_description: string;
  competitors: string;
  unique_value: string;
  responsible_name: string;
  instagram_handle: string;
}

export function OnboardingQuestionnaire() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    field: string;
    suggestion: string;
    improved: string;
  } | null>(null);
  const [validationAttempts, setValidationAttempts] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false);

  // Speech recognition
  const [isListening, setIsListening] = useState(false);

  // Diferencial em perguntas
  const [diff1, setDiff1] = useState("");
  const [diff2, setDiff2] = useState("");
  const [diff3, setDiff3] = useState("");

  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    business_name: "",
    niche: "",
    target_audience: "",
    main_goal: "",
    platforms: "",
    communication_style: "",
    growth_speed: "moderado",
    brand_description: "",
    competitors: "",
    unique_value: "",
    responsible_name: "",
    instagram_handle: "",
  });

  // Concatenar diferenciais
  useEffect(() => {
    if (diff1 || diff2 || diff3) {
      const uniqueValue = `O que faço diferente: ${diff1 || "não informado"}. Por que clientes voltam: ${diff2 || "não informado"}. Elogio mais recebido: ${diff3 || "não informado"}`;
      updateField("unique_value", uniqueValue);
    }
  }, [diff1, diff2, diff3]);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 4000);
    }
  }, [isComplete]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: false }));
    }
    // Limpar sugestão quando usuário começa a digitar
    if (aiSuggestion?.field === field) {
      setAiSuggestion(null);
      setValidationAttempts(0);
    }
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
      if (!formData.platforms) errors.platforms = true;
      if (!formData.growth_speed) errors.growth_speed = true;
    } else if (stepNumber === 3) {
      if (!formData.communication_style) errors.communication_style = true;
      if (!formData.brand_description.trim()) errors.brand_description = true;
    } else if (stepNumber === 4) {
      if (!diff1.trim() && !diff2.trim() && !diff3.trim()) {
        errors.unique_value = true;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getStepData = (stepNumber: number): Partial<FormData> => {
    switch (stepNumber) {
      case 1:
        return {
          business_name: formData.business_name,
          niche: formData.niche,
          target_audience: formData.target_audience,
          responsible_name: formData.responsible_name,
        };
      case 2:
        return {
          main_goal: formData.main_goal,
          platforms: formData.platforms,
          growth_speed: formData.growth_speed,
        };
      case 3:
        return {
          communication_style: formData.communication_style,
          brand_description: formData.brand_description,
        };
      case 4:
        return {
          unique_value: formData.unique_value,
        };
      default:
        return {};
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome, Edge ou Safari.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      updateField("brand_description", transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      setIsListening(false);
      alert("Erro ao acessar o microfone. Verifique as permissões.");
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Erro ao iniciar reconhecimento:", err);
      setIsListening(false);
    }
  };

  // Função para gerar público-alvo com IA
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

      if (!res.ok) throw new Error(data.error || "Erro ao gerar público-alvo");

      // Mostrar sugestão da IA
      setAiSuggestion({
        field: "target_audience",
        suggestion: "Sugestão de público-alvo gerada pela IA:",
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
    if (aiSuggestion && aiSuggestion.field) {
      updateField(aiSuggestion.field as keyof FormData, aiSuggestion.improved);
      setAiSuggestion(null);
      setValidationAttempts(0);

      // Avançar para o próximo passo automaticamente
      setTimeout(() => {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 300);
    }
  };

  const rejectSuggestion = () => {
    setAiSuggestion(null);
    // Se já tentou 2 vezes, deixa passar
    if (validationAttempts >= 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const validateWithAI = async (
    stepData: Partial<FormData>,
  ): Promise<{
    isValid: boolean;
    suggestion?: string;
    improved?: string;
    field?: string;
  }> => {
    try {
      const res = await fetch("/api/validate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepData,
          step,
          attempt: validationAttempts,
          currentText:
            stepData.target_audience ||
            stepData.brand_description ||
            stepData.unique_value ||
            "",
        }),
      });

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Erro na validação com IA:", err);
      return { isValid: true };
    }
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    // Se for step 1 e o público-alvo for muito vago, oferecer geração
    if (step === 1) {
      const targetAudience = formData.target_audience.toLowerCase().trim();
      const vagueTerms = [
        "todos",
        "todo mundo",
        "geral",
        "público geral",
        "qualquer pessoa",
        "tudo",
        "tudo e todos",
      ];

      if (
        vagueTerms.some((term) => targetAudience.includes(term)) ||
        targetAudience.length < 20
      ) {
        setAiSuggestion({
          field: "target_audience",
          suggestion:
            "Seu público-alvo está muito vago. Posso gerar um público-alvo específico para você?",
          improved: "",
        });
        setValidationAttempts(1);
        return;
      }
    }

    setIsValidating(true);
    setError(null);
    setAiSuggestion(null);

    try {
      const result = await validateWithAI(getStepData(step));

      if (!result.isValid && result.suggestion && result.field) {
        setAiSuggestion({
          field: result.field,
          suggestion: result.suggestion,
          improved: result.improved || "",
        });
        setIsValidating(false);
        return;
      }
    } catch (err) {
      console.error("Erro na validação:", err);
    }

    setIsValidating(false);
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Não autenticado");

      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        window.location.href = "/dashboard";
        return;
      }

      const { error: insertError } = await supabase.from("businesses").insert({
        user_id: user.id,
        business_name: formData.business_name,
        niche: formData.niche,
        target_audience: formData.target_audience,
        main_goal: formData.main_goal,
        platforms: formData.platforms,
        communication_style: formData.communication_style,
        growth_speed: formData.growth_speed,
        brand_description: formData.brand_description,
        competitors: formData.competitors || null,
        unique_value: formData.unique_value,
        responsible_name: formData.responsible_name,
        instagram_handle: formData.instagram_handle.replace("@", "") || null,
        onboarding_complete: true,
      });

      if (insertError) throw insertError;

      // GERAR ESTRATÉGIA AUTOMATICAMENTE
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      try {
        await fetch("/api/strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month, year }),
        });
      } catch (strategyErr) {
        console.error("Erro na requisição da estratégia:", strategyErr);
      }

      setIsComplete(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar dados.");
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="size-24 rounded-full border-4 border-primary border-t-transparent"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-bold text-primary">
            Preparando tudo para você...
          </h2>
          <p className="text-muted-foreground">
            Criando sua estratégia personalizada ✨
          </p>
        </motion.div>
      </div>
    );
  }

  const hasError = (field: keyof FormData) => validationErrors[field];

  // Mensagens de exemplo para cada campo
  const getPlaceholder = (field: string) => {
    const placeholders: Record<string, string> = {
      target_audience:
        "Ex: Mulheres de 25-40 anos, classe média, interessadas em moda sustentável",
      niche: "Ex: Moda plus size feminina para trabalho",
      brand_description:
        "Ex: Marca jovem e descontraída que valoriza a autoestima e o corpo real",
      unique_value: "Ex: Estampas exclusivas criadas por artistas locais",
    };
    return placeholders[field] || "";
  };

  // Dicas para cada campo
  const getFieldTip = (field: string) => {
    const tips: Record<string, string> = {
      target_audience:
        "Inclua: idade • gênero • localização • interesses • comportamentos",
      niche:
        "Quanto mais específico, melhor! Ex: 'Moda plus size' em vez de só 'Moda'",
      brand_description:
        "Descreva: personalidade • valores • missão • tom de voz",
      unique_value:
        "O que ninguém mais oferece? Qualidade? Preço? Atendimento?",
    };
    return tips[field] || "";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/20 via-background to-purple-600/20 flex items-start justify-center p-3 pt-16 pb-24 relative overflow-y-auto">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl rounded-md overflow-visible">
          <CardHeader className="text-center px-4 pt-6 pb-2">
            <motion.div
              className="relative mx-auto mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-50 scale-150" />
              {step === 1 && (
                <Rocket className="size-12 sm:size-14 text-primary relative z-10" />
              )}
              {step === 2 && (
                <Target className="size-12 sm:size-14 text-primary relative z-10" />
              )}
              {step === 3 && (
                <Zap className="size-12 sm:size-14 text-primary relative z-10" />
              )}
              {step === 4 && (
                <Sparkles className="size-12 sm:size-14 text-primary relative z-10" />
              )}
            </motion.div>

            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              {step === 1 && "Vamos decolar! 🚀"}
              {step === 2 && "Defina seus objetivos 🎯"}
              {step === 3 && "Sua marca, seu estilo ⚡"}
              {step === 4 && "Últimos detalhes ✨"}
            </CardTitle>

            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Passo {step} de {TOTAL_STEPS}
            </CardDescription>

            <div className="mt-3 flex gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 h-1 bg-secondary rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-purple-600"
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
                        className={`h-10 text-sm rounded-md ${hasError("business_name") ? "border-destructive" : ""}`}
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
                        className="text-sm font-medium flex items-center gap-1"
                      >
                        <User className="size-3" />
                        Seu nome (responsável) *
                      </Label>
                      <Input
                        id="responsible_name"
                        placeholder="Ex: João Silva"
                        value={formData.responsible_name}
                        onChange={(e) =>
                          updateField("responsible_name", e.target.value)
                        }
                        className={`h-10 text-sm rounded-md ${hasError("responsible_name") ? "border-destructive" : ""}`}
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
                        placeholder={getPlaceholder("niche")}
                        value={formData.niche}
                        onChange={(e) => updateField("niche", e.target.value)}
                        className={`h-10 text-sm rounded-md ${hasError("niche") ? "border-destructive" : ""}`}
                      />
                      {hasError("niche") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                      <div className="flex items-start gap-1 mt-1">
                        <Lightbulb className="size-3 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          {getFieldTip("niche")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="instagram_handle"
                        className="text-sm font-medium flex items-center gap-1"
                      >
                        <Instagram className="size-3" />
                        Instagram (opcional)
                      </Label>
                      <Input
                        id="instagram_handle"
                        placeholder="@seudominio"
                        value={formData.instagram_handle}
                        onChange={(e) =>
                          updateField("instagram_handle", e.target.value)
                        }
                        className="h-10 text-sm rounded-md"
                      />
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
                          placeholder={getPlaceholder("target_audience")}
                          value={formData.target_audience}
                          onChange={(e) =>
                            updateField("target_audience", e.target.value)
                          }
                          rows={3}
                          className={`resize-none text-sm min-h-[80px] rounded-md pr-12 ${hasError("target_audience") ? "border-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={generateTargetAudience}
                          disabled={
                            isGeneratingAudience ||
                            !formData.business_name ||
                            !formData.niche
                          }
                          className="absolute right-3 top-3 rounded-full p-2 bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Gerar público-alvo com IA"
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
                      <div className="flex items-start gap-1 mt-1">
                        <Lightbulb className="size-3 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          {getFieldTip("target_audience")}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="main_goal"
                        className="text-sm font-medium"
                      >
                        Objetivo principal *
                      </Label>
                      <Select
                        value={formData.main_goal}
                        onValueChange={(val) => updateField("main_goal", val)}
                      >
                        <SelectTrigger
                          className={`h-10 text-sm rounded-md ${hasError("main_goal") ? "border-destructive" : ""}`}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engajamento">
                            🔥 Aumentar engajamento
                          </SelectItem>
                          <SelectItem value="seguidores">
                            📈 Ganhar seguidores
                          </SelectItem>
                          <SelectItem value="vendas">
                            💰 Aumentar vendas
                          </SelectItem>
                          <SelectItem value="autoridade">
                            👑 Construir autoridade
                          </SelectItem>
                          <SelectItem value="leads">🎯 Gerar leads</SelectItem>
                        </SelectContent>
                      </Select>
                      {hasError("main_goal") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="platforms"
                        className="text-sm font-medium"
                      >
                        Plataformas *
                      </Label>
                      <Select
                        value={formData.platforms}
                        onValueChange={(val) => updateField("platforms", val)}
                      >
                        <SelectTrigger
                          className={`h-10 text-sm rounded-md ${hasError("platforms") ? "border-destructive" : ""}`}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">
                            📱 Instagram
                          </SelectItem>
                          <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                          <SelectItem value="instagram_tiktok">
                            📱 + 🎵
                          </SelectItem>
                          <SelectItem value="todas">🌐 Todas</SelectItem>
                        </SelectContent>
                      </Select>
                      {hasError("platforms") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="growth_speed"
                        className="text-sm font-medium"
                      >
                        Velocidade de crescimento *
                      </Label>
                      <Select
                        value={formData.growth_speed}
                        onValueChange={(val) =>
                          updateField("growth_speed", val)
                        }
                      >
                        <SelectTrigger
                          className={`h-10 text-sm rounded-md ${hasError("growth_speed") ? "border-destructive" : ""}`}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rapido">
                            🚀 Crescimento rápido (posto todo dia)
                          </SelectItem>
                          <SelectItem value="moderado">
                            ⚡ Crescimento moderado (3-4x semana)
                          </SelectItem>
                          <SelectItem value="leve">
                            🌱 Crescimento leve (1-2x semana)
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Label
                        htmlFor="communication_style"
                        className="text-sm font-medium"
                      >
                        Estilo de comunicação *
                      </Label>
                      <Select
                        value={formData.communication_style}
                        onValueChange={(val) =>
                          updateField("communication_style", val)
                        }
                      >
                        <SelectTrigger
                          className={`h-10 text-sm rounded-md ${hasError("communication_style") ? "border-destructive" : ""}`}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">👔 Formal</SelectItem>
                          <SelectItem value="casual">😊 Casual</SelectItem>
                          <SelectItem value="inspirador">
                            ✨ Inspirador
                          </SelectItem>
                          <SelectItem value="educativo">
                            📚 Educativo
                          </SelectItem>
                          <SelectItem value="humoristico">
                            😂 Humorístico
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {hasError("communication_style") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="brand_description"
                        className="text-sm font-medium"
                      >
                        Descrição da marca *
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="brand_description"
                          placeholder={getPlaceholder("brand_description")}
                          value={formData.brand_description}
                          onChange={(e) =>
                            updateField("brand_description", e.target.value)
                          }
                          rows={3}
                          className={`resize-none text-sm min-h-[80px] rounded-md pr-12 ${hasError("brand_description") ? "border-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={startListening}
                          className={`absolute right-3 top-3 rounded-full p-2 transition-all ${
                            isListening
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                          title="Clique para falar"
                        >
                          <Mic className="size-4" />
                        </button>
                      </div>
                      {isListening && (
                        <p className="text-xs text-red-400 animate-pulse">
                          🎙️ Ouvindo... Fale agora
                        </p>
                      )}
                      {hasError("brand_description") && (
                        <p className="text-xs text-destructive">
                          Campo obrigatório
                        </p>
                      )}
                      <div className="flex items-start gap-1 mt-1">
                        <Lightbulb className="size-3 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          {getFieldTip("brand_description")}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="competitors"
                        className="text-sm font-medium"
                      >
                        Concorrentes (opcional)
                      </Label>
                      <Textarea
                        id="competitors"
                        placeholder="Liste 2-3 perfis que você admira..."
                        value={formData.competitors}
                        onChange={(e) =>
                          updateField("competitors", e.target.value)
                        }
                        rows={2}
                        className="resize-none text-sm rounded-md"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Seu diferencial *
                      </Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="O que você faz que seus concorrentes não fazem?"
                          value={diff1}
                          onChange={(e) => setDiff1(e.target.value)}
                          className="text-sm rounded-md"
                        />
                        <Input
                          placeholder="Por que seus clientes voltam?"
                          value={diff2}
                          onChange={(e) => setDiff2(e.target.value)}
                          className="text-sm rounded-md"
                        />
                        <Input
                          placeholder="Qual elogio você mais recebe?"
                          value={diff3}
                          onChange={(e) => setDiff3(e.target.value)}
                          className="text-sm rounded-md"
                        />
                      </div>
                      {hasError("unique_value") && (
                        <p className="text-xs text-destructive">
                          Responda pelo menos uma pergunta
                        </p>
                      )}
                      <div className="flex items-start gap-1 mt-1">
                        <Lightbulb className="size-3 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          {getFieldTip("unique_value")}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Sugestão da IA */}
                {aiSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="bg-primary/10 border-2 border-primary/30 p-5 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Wand2 className="size-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary mb-2">
                          {aiSuggestion.suggestion}
                        </p>

                        {aiSuggestion.improved && (
                          <div className="bg-background/50 p-3 rounded-lg mb-4 border border-primary/20">
                            <p className="text-sm whitespace-pre-wrap">
                              {aiSuggestion.improved}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {aiSuggestion.improved && (
                            <Button
                              size="sm"
                              onClick={applySuggestion}
                              className="gap-2 bg-primary hover:bg-primary/90"
                            >
                              <Sparkles className="size-4" />
                              Usar sugestão
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={rejectSuggestion}
                            className="gap-2"
                          >
                            <X className="size-4" />
                            {validationAttempts >= 2
                              ? "Continuar mesmo assim"
                              : "Manter meu texto"}
                          </Button>
                          {!aiSuggestion.improved &&
                            aiSuggestion.field === "target_audience" && (
                              <Button
                                size="sm"
                                onClick={generateTargetAudience}
                                disabled={isGeneratingAudience}
                                className="gap-2 bg-primary hover:bg-primary/90"
                              >
                                {isGeneratingAudience ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <>
                                    <Wand2 className="size-4" />
                                    Gerar para mim
                                  </>
                                )}
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-destructive bg-destructive/10 p-2 rounded-md"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex items-center justify-between pt-3 mt-1 border-t border-primary/10">
                  {step > 1 ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(step - 1);
                        setAiSuggestion(null);
                        setValidationAttempts(0);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      size="sm"
                      className="gap-1 text-xs h-9 px-3 rounded-md"
                      disabled={isValidating}
                    >
                      <ArrowLeft className="size-3" />
                      Voltar
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < TOTAL_STEPS ? (
                    <Button
                      onClick={handleNext}
                      disabled={isValidating || !!aiSuggestion}
                      size="sm"
                      className="gap-1 bg-gradient-to-r from-primary to-purple-600 text-xs h-9 px-4 rounded-md"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        <>
                          Próximo
                          <ArrowRight className="size-3" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading || isValidating || !!aiSuggestion}
                      size="sm"
                      className="gap-1 bg-gradient-to-r from-primary to-purple-600 text-xs h-9 px-4 rounded-md"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          Finalizar
                          <Sparkles className="size-3" />
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
