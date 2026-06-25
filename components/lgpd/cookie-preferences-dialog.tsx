"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  type ConsentCategories,
  DEFAULT_CONSENT,
} from "@/lib/lgpd/consent-storage";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ConsentCategories;
  onSave: (categories: ConsentCategories) => void;
};

export function CookiePreferencesDialog({
  open,
  onOpenChange,
  initial = DEFAULT_CONSENT,
  onSave,
}: Props) {
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [marketing, setMarketing] = useState(initial.marketing);

  function handleSave() {
    onSave({ essential: true, analytics, marketing });
    onOpenChange(false);
  }

  function handleAcceptAll() {
    setAnalytics(true);
    setMarketing(true);
    onSave({ essential: true, analytics: true, marketing: true });
    onOpenChange(false);
  }

  function handleRejectAll() {
    setAnalytics(false);
    setMarketing(false);
    onSave({ essential: true, analytics: false, marketing: false });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preferências de cookies</DialogTitle>
          <DialogDescription>
            Escolha quais cookies você permite. Para detalhes, veja a{" "}
            <Link
              href="/politica-de-cookies"
              className="text-lime hover:underline"
              onClick={() => onOpenChange(false)}
            >
              Política de Cookies
            </Link>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <CategoryRow
            title="Estritamente necessários"
            description="Indispensáveis para autenticação e funcionamento básico. Não podem ser desativados."
            checked={true}
            disabled
            onChange={() => undefined}
          />
          <CategoryRow
            title="Analytics"
            description="Métricas agregadas de uso para melhorar o produto."
            checked={analytics}
            onChange={setAnalytics}
          />
          <CategoryRow
            title="Marketing"
            description="Mensuração de campanhas e personalização de anúncios."
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-3">
          <Button variant="ghost" onClick={handleRejectAll}>
            Apenas essenciais
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button variant="outline" onClick={handleSave}>
              Salvar seleção
            </Button>
            <Button onClick={handleAcceptAll}>Aceitar todos</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card/30 p-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label={title}
      />
    </div>
  );
}
