"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  User,
  Store,
  Target,
  Globe,
  Users,
  Sparkles,
  Instagram,
  AlertCircle,
  Settings,
} from "lucide-react";

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("businesses")
        .update({
          responsible_name: formData.responsible_name,
          business_name: formData.business_name,
          niche: formData.niche,
          target_audience: formData.target_audience,
          main_goal: formData.main_goal,
          platforms: formData.platforms,
          communication_style: formData.communication_style,
          growth_speed: formData.growth_speed,
          brand_description: formData.brand_description,
          instagram_handle: formData.instagram_handle.replace("@", ""),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="size-6 md:size-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as informações do seu negócio
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card className="border-2 border-primary/20 bg-card/50 rounded-md">
        <CardContent className="p-6 space-y-8">
          {/* Seção 1: Informações Pessoais */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-primary/10 pb-2">
              <User className="size-4 text-primary" />
              Informações Pessoais
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="responsible_name">Nome do responsável</Label>
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

          {/* Seção 2: Sobre o Negócio */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-primary/10 pb-2">
              <Store className="size-4 text-primary" />
              Sobre o Negócio
            </h2>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nome do negócio</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        business_name: e.target.value,
                      })
                    }
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niche">Nicho / Segmento</Label>
                  <Input
                    id="niche"
                    value={formData.niche}
                    onChange={(e) =>
                      setFormData({ ...formData, niche: e.target.value })
                    }
                    className="rounded-md"
                    placeholder="Ex: Moda plus size feminina"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_audience">Público-alvo</Label>
                <Textarea
                  id="target_audience"
                  rows={3}
                  value={formData.target_audience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_audience: e.target.value,
                    })
                  }
                  className="rounded-md resize-none"
                  placeholder="Descreva seu cliente ideal (idade, gênero, interesses, comportamentos...)"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Objetivos e Estratégia */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-primary/10 pb-2">
              <Target className="size-4 text-primary" />
              Objetivos e Estratégia
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="main_goal">Objetivo principal</Label>
                <Select
                  value={formData.main_goal}
                  onValueChange={(val) =>
                    setFormData({ ...formData, main_goal: val })
                  }
                >
                  <SelectTrigger id="main_goal" className="rounded-md">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engajamento">
                      🔥 Aumentar engajamento
                    </SelectItem>
                    <SelectItem value="seguidores">
                      📈 Ganhar seguidores
                    </SelectItem>
                    <SelectItem value="vendas">💰 Aumentar vendas</SelectItem>
                    <SelectItem value="autoridade">
                      👑 Construir autoridade
                    </SelectItem>
                    <SelectItem value="leads">🎯 Gerar leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platforms">Plataformas</Label>
                <Select
                  value={formData.platforms}
                  onValueChange={(val) =>
                    setFormData({ ...formData, platforms: val })
                  }
                >
                  <SelectTrigger id="platforms" className="rounded-md">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">📱 Instagram</SelectItem>
                    <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                    <SelectItem value="instagram_tiktok">📱 + 🎵</SelectItem>
                    <SelectItem value="todas">🌐 Todas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="growth_speed">Velocidade de crescimento</Label>
                <Select
                  value={formData.growth_speed}
                  onValueChange={(val) =>
                    setFormData({ ...formData, growth_speed: val })
                  }
                >
                  <SelectTrigger id="growth_speed" className="rounded-md">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="communication_style">
                  Estilo de comunicação
                </Label>
                <Select
                  value={formData.communication_style}
                  onValueChange={(val) =>
                    setFormData({ ...formData, communication_style: val })
                  }
                >
                  <SelectTrigger
                    id="communication_style"
                    className="rounded-md"
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">👔 Formal</SelectItem>
                    <SelectItem value="casual">😊 Casual</SelectItem>
                    <SelectItem value="inspirador">✨ Inspirador</SelectItem>
                    <SelectItem value="educativo">📚 Educativo</SelectItem>
                    <SelectItem value="humoristico">😂 Humorístico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Seção 4: Marca e Diferenciais */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-primary/10 pb-2">
              <Sparkles className="size-4 text-primary" />
              Marca e Diferenciais
            </h2>
            <div className="space-y-2">
              <Label htmlFor="brand_description">Descrição da marca</Label>
              <Textarea
                id="brand_description"
                rows={4}
                value={formData.brand_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brand_description: e.target.value,
                  })
                }
                className="rounded-md resize-none"
                placeholder="Descreva a personalidade, valores e missão da sua marca..."
              />
            </div>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 p-3 rounded-md"
            >
              <Sparkles className="size-4 shrink-0" />
              Dados salvos com sucesso!
            </motion.div>
          )}

          {/* Botão salvar */}
          <div className="flex justify-end pt-4 border-t border-primary/10">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-6 rounded-md"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dica */}
      <div className="bg-primary/5 border border-primary/10 rounded-md p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Quanto mais detalhadas suas informações, melhores serão as estratégias
          geradas pela IA!
        </p>
      </div>
    </motion.div>
  );
}
