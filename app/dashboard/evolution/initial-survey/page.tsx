"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  Users,
  Eye,
  Camera,
  Mic,
  Video,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function InitialSurveyPage() {
  const [followers, setFollowers] = useState("");
  const [storiesViews, setStoriesViews] = useState("");
  const [equipment, setEquipment] = useState({
    camera: false,
    microphone: false,
    lighting: false,
    tripod: false,
  });
  const [investment, setInvestment] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
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
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (business) {
        setBusinessId(business.id);
      }
    } catch (error) {
      console.error("Erro ao carregar negócio:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!followers || !storiesViews || !investment || !businessId) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { error } = await supabase.from("evolution_data").upsert({
        user_id: user.id,
        business_id: businessId,
        current_followers: Number(followers),
        current_stories_views: Number(storiesViews),
        monthly_investment: Number(investment),
        month,
        year,
      });

      if (error) throw error;

      router.push("/dashboard/evolution");
    } catch (error) {
      console.error("Erro ao salvar pesquisa:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/20 flex items-center justify-center p-4">
      {/* Background blurs */}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-xl rounded-md">
          <CardHeader className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mx-auto mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-50 scale-150" />
                <Lightbulb className="size-16 text-primary relative z-10" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Vamos entender sua jornada! 🚀
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Responda rapidinho para personalizarmos sua evolução
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6">
            <div className="space-y-4">
              {/* Seguidores */}
              <div className="space-y-2">
                <Label
                  htmlFor="followers"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Users className="size-4 text-primary" />
                  Quantos seguidores você tem hoje?
                </Label>
                <Input
                  id="followers"
                  type="number"
                  placeholder="Ex: 1000"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  className="h-11 text-sm rounded-md"
                />
              </div>

              {/* Visualizações Stories */}
              <div className="space-y-2">
                <Label
                  htmlFor="stories"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Eye className="size-4 text-primary" />
                  Média de visualizações nos Stories?
                </Label>
                <Input
                  id="stories"
                  type="number"
                  placeholder="Ex: 200"
                  value={storiesViews}
                  onChange={(e) => setStoriesViews(e.target.value)}
                  className="h-11 text-sm rounded-md"
                />
              </div>

              {/* Equipamentos */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  O que você já tem?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-md border border-primary/10">
                    <Checkbox
                      id="camera"
                      checked={equipment.camera}
                      onCheckedChange={(checked) =>
                        setEquipment((prev) => ({
                          ...prev,
                          camera: checked === true,
                        }))
                      }
                    />
                    <Label
                      htmlFor="camera"
                      className="text-sm cursor-pointer flex items-center gap-1"
                    >
                      <Camera className="size-4 text-primary" />
                      Câmera
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-md border border-primary/10">
                    <Checkbox
                      id="mic"
                      checked={equipment.microphone}
                      onCheckedChange={(checked) =>
                        setEquipment((prev) => ({
                          ...prev,
                          microphone: checked === true,
                        }))
                      }
                    />
                    <Label
                      htmlFor="mic"
                      className="text-sm cursor-pointer flex items-center gap-1"
                    >
                      <Mic className="size-4 text-primary" />
                      Microfone
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-md border border-primary/10">
                    <Checkbox
                      id="lighting"
                      checked={equipment.lighting}
                      onCheckedChange={(checked) =>
                        setEquipment((prev) => ({
                          ...prev,
                          lighting: checked === true,
                        }))
                      }
                    />
                    <Label
                      htmlFor="lighting"
                      className="text-sm cursor-pointer flex items-center gap-1"
                    >
                      <Lightbulb className="size-4 text-primary" />
                      Iluminação
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-md border border-primary/10">
                    <Checkbox
                      id="tripod"
                      checked={equipment.tripod}
                      onCheckedChange={(checked) =>
                        setEquipment((prev) => ({
                          ...prev,
                          tripod: checked === true,
                        }))
                      }
                    />
                    <Label
                      htmlFor="tripod"
                      className="text-sm cursor-pointer flex items-center gap-1"
                    >
                      <Video className="size-4 text-primary" />
                      Tripé
                    </Label>
                  </div>
                </div>
              </div>

              {/* Investimento */}
              <div className="space-y-2">
                <Label
                  htmlFor="investment"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Sparkles className="size-4 text-primary" />
                  Quanto pode investir esse mês? (R$)
                </Label>
                <Input
                  id="investment"
                  type="number"
                  placeholder="Ex: 500"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  className="h-11 text-sm rounded-md"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Esse valor será usado para sugerir equipamentos e ações
                  realistas
                </p>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={
                !followers ||
                !storiesViews ||
                !investment ||
                loading ||
                !businessId
              }
              className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 gap-2 text-base rounded-md"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Iniciar Jornada
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Você poderá ajustar esses dados depois nas configurações
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
