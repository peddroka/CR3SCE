"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, getUserSafely } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CreditCard,
  Info,
  Instagram,
  Loader2,
  Lock,
  Save,
  Settings,
  Sparkles,
  Store,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    responsible_name: "",
    business_name: "",
    niche: "",
    target_audience: "",
    main_goal: "",
    platforms: "",
    communication_style: "",
    growth_speed: "",
    brand_description: "",
    instagram_handle: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user } = await getUserSafely(supabase);

        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data: business } = await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (business) {
          setFormData({
            responsible_name: business.responsible_name || "",
            business_name: business.business_name || "",
            niche: business.niche || "",
            target_audience: business.target_audience || "",
            main_goal: business.main_goal || "",
            platforms: business.platforms || "",
            communication_style: business.communication_style || "",
            growth_speed: business.growth_speed || "moderado",
            brand_description: business.brand_description || "",
            instagram_handle: business.instagram_handle || "",
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [router, supabase]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { user } = await getUserSafely(supabase);

      if (!user) {
        throw new Error("Usuario nao autenticado");
      }

      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          responsible_name: formData.responsible_name,
          instagram_handle: formData.instagram_handle.replace("@", ""),
        })
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Nao foi possivel salvar as alteracoes.");
      }
    } finally {
      setSaving(false);
    }
  };

  const goalLabels: Record<string, string> = {
    visualizacao: "📣 Aumentar visualizacao",
    identidade: "🧭 Construir identidade",
    engajamento: "🔥 Aumentar engajamento",
    seguidores: "📈 Ganhar seguidores",
    vendas: "💰 Aumentar vendas",
    autoridade: "👑 Construir autoridade",
    leads: "🎯 Gerar leads",
  };

  const platformLabels: Record<string, string> = {
    instagram: "📱 Instagram",
    todas: "🌐 Todas as redes",
  };

  const speedLabels: Record<string, string> = {
    rapido: "🚀 Explosivo (stories, feed, reels e viral no fim de semana)",
    moderado: "⚡ Moderado (stories diarios, feed diario e reels semanais)",
    leve: "🌱 Crescimento leve (1-2x semana)",
  };

  const styleLabels: Record<string, string> = {
    humoristico: "😂 Humoristico",
    educativo: "📚 Educativo",
    casual: "😊 Casual",
    formal: "👔 Formal",
    inspirador: "✨ Inspirador",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-12"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Settings className="size-6 text-primary md:size-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Configuracoes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as informacoes do seu negocio
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-[#C8F135]" />
        <div>
          <p className="text-sm font-medium text-[#C8F135]">
            Campos do negocio bloqueados
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#888]">
            As informacoes do negocio so podem ser alteradas uma vez por mes, no
            periodo de renovacao da assinatura. Voce pode alterar livremente seu
            nome e Instagram a qualquer momento.
          </p>
        </div>
      </div>

      <Card className="rounded-xl border border-border bg-card">
        <CardContent className="space-y-8 p-6">
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold">
              <User className="size-4 text-[#C8F135]" />
              Informacoes Pessoais
              <span className="ml-auto rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10 px-2 py-0.5 text-[11px] font-normal text-[#C8F135]">
                Editavel
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="responsible_name">Nome do responsavel</Label>
                <Input
                  id="responsible_name"
                  value={formData.responsible_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responsible_name: e.target.value,
                    })
                  }
                  className="rounded-md"
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="instagram_handle"
                  className="flex items-center gap-1"
                >
                  <Instagram className="size-3" />
                  Instagram
                </Label>
                <Input
                  id="instagram_handle"
                  placeholder="@seudominio"
                  value={formData.instagram_handle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instagram_handle: e.target.value,
                    })
                  }
                  className="rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold">
              <Store className="size-4 text-[#888]" />
              Sobre o Negocio
              <span className="ml-auto flex items-center gap-1 rounded-full border border-border bg-white/5 px-2 py-0.5 text-[11px] font-normal text-[#555]">
                <Lock className="size-2.5" />
                Bloqueado
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#888]">Nome do negocio</Label>
                <div className="rounded-md border border-border bg-white/5 px-3 py-2.5 text-sm text-[#666] opacity-60">
                  {formData.business_name || "Nao informado"}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#888]">Nicho / Segmento</Label>
                <div className="rounded-md border border-border bg-white/5 px-3 py-2.5 text-sm text-[#666] opacity-60">
                  {formData.niche || "Nao informado"}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#888]">Publico-alvo</Label>
              <div className="rounded-md border border-border bg-white/5 px-3 py-2.5 text-sm text-[#666] opacity-60">
                {formData.target_audience || "Nao informado"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold">
              <Target className="size-4 text-[#888]" />
              Objetivos e Estrategia
              <span className="ml-auto flex items-center gap-1 rounded-full border border-border bg-white/5 px-2 py-0.5 text-[11px] font-normal text-[#555]">
                <Lock className="size-2.5" />
                Bloqueado
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  label: "Objetivo principal",
                  value: goalLabels[formData.main_goal] || formData.main_goal,
                },
                {
                  label: "Plataformas",
                  value:
                    platformLabels[formData.platforms] || formData.platforms,
                },
                {
                  label: "Velocidade de crescimento",
                  value:
                    speedLabels[formData.growth_speed] ||
                    formData.growth_speed,
                },
                {
                  label: "Estilo de comunicacao",
                  value:
                    styleLabels[formData.communication_style] ||
                    formData.communication_style,
                },
              ].map((field) => (
                <div key={field.label} className="space-y-2">
                  <Label className="text-[#888]">{field.label}</Label>
                  <div className="rounded-md border border-border bg-white/5 px-3 py-2.5 text-sm text-[#666] opacity-60">
                    {field.value || "Nao informado"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold">
              <Sparkles className="size-4 text-[#888]" />
              Marca e Diferenciais
              <span className="ml-auto flex items-center gap-1 rounded-full border border-border bg-white/5 px-2 py-0.5 text-[11px] font-normal text-[#555]">
                <Lock className="size-2.5" />
                Bloqueado
              </span>
            </h2>
            <div className="space-y-2">
              <Label className="text-[#888]">Descricao da marca</Label>
              <div className="min-h-[80px] rounded-md border border-border bg-white/5 px-3 py-2.5 text-sm text-[#666] opacity-60">
                {formData.brand_description || "Nao informado"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold">
              <CreditCard className="size-4 text-[#C8F135]" />
              Pagamento
            </h2>
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Plano CR3SCE Pro
                  </p>
                  <p className="text-xs text-[#666]">
                    R$79,90/mes - Renovacao automatica
                  </p>
                </div>
                <span className="rounded-full border border-[#C8F135]/30 bg-[#C8F135]/10 px-3 py-1 text-xs font-medium text-[#C8F135]">
                  Ativo
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex flex-col gap-2 text-xs text-[#666]">
                {[
                  "Calendario de 30 dias todo mes",
                  "Chat IA ilimitado",
                  "Suporte via WhatsApp",
                  "Cancele quando quiser",
                ].map((item) => (
                  <p key={item} className="flex items-center gap-2">
                    <span className="text-[#C8F135]">✓</span> {item}
                  </p>
                ))}
              </div>
              <a
                href="https://pay.cakto.com.br/34v8jnh_813702"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-xs text-[#555] transition-colors hover:text-[#C8F135]"
              >
                Gerenciar assinatura ↗
              </a>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-500"
            >
              <Sparkles className="size-4 shrink-0" />
              Nome e Instagram salvos com sucesso!
            </motion.div>
          )}

          <div className="flex justify-end border-t border-border pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 rounded-md bg-[#C8F135] px-6 font-semibold text-[#111] hover:bg-[#a8d020]"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Salvar nome e Instagram
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



