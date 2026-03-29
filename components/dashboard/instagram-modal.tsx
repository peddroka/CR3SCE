"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Instagram, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface InstagramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: any;
}

export function InstagramModal({
  open,
  onOpenChange,
  business,
}: InstagramModalProps) {
  const [instagramValue, setInstagramValue] = useState(
    business?.instagram_handle || "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSave = async () => {
    if (!business?.id) return;

    setSaving(true);
    setError(null);

    try {
      // Remover @ se o usuário digitou
      const cleanHandle = instagramValue.replace("@", "").trim();

      const { error } = await supabase
        .from("businesses")
        .update({ instagram_handle: cleanHandle })
        .eq("id", business.id);

      if (error) throw error;

      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="size-5 text-primary" />
            Conectar Instagram
          </DialogTitle>
          <DialogDescription>
            Adicione seu Instagram para personalizar suas estratégias
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-primary/5 p-3 rounded-md text-sm text-muted-foreground">
            <p>
              Adicione seu Instagram para que a IA possa personalizar ainda mais
              suas estratégias e sugerir conteúdos específicos para seu perfil!
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Seu @ do Instagram</Label>
            <Input
              id="instagram"
              placeholder="@seudominio"
              value={instagramValue}
              onChange={(e) => setInstagramValue(e.target.value)}
              className="rounded-md"
            />
            <p className="text-xs text-muted-foreground">
              Digite sem o @ ou com o @ - tanto faz
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-md"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
