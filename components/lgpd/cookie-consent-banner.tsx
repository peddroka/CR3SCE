"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CookiePreferencesDialog } from "./cookie-preferences-dialog";
import {
  DEFAULT_CONSENT,
  FULL_CONSENT,
  getStoredConsent,
  setStoredConsent,
  type ConsentCategories,
} from "@/lib/lgpd/consent-storage";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initial, setInitial] = useState<ConsentCategories>(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    } else {
      setInitial(stored.categories);
    }

    // Permite reabrir via evento global (link no rodapé)
    function handleOpenPrefs() {
      const current = getStoredConsent();
      setInitial(current?.categories ?? DEFAULT_CONSENT);
      setDialogOpen(true);
    }
    window.addEventListener("cr3sce:open-cookie-prefs", handleOpenPrefs);
    return () =>
      window.removeEventListener("cr3sce:open-cookie-prefs", handleOpenPrefs);
  }, []);

  function handleSave(categories: ConsentCategories) {
    setStoredConsent(categories);
    setInitial(categories);
    setVisible(false);
  }

  function handleAcceptAll() {
    handleSave(FULL_CONSENT);
  }

  function handleRejectAll() {
    handleSave(DEFAULT_CONSENT);
  }

  return (
    <>
      {visible && (
        <div
          role="dialog"
          aria-label="Aviso de cookies"
          aria-live="polite"
          className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-y-auto border-t border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl md:p-6"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <div className="flex items-start gap-3 pr-8 md:pr-0">
              <Cookie className="mt-0.5 size-5 shrink-0 text-lime" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Usamos cookies para melhorar sua experiência
                </p>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  Usamos cookies essenciais para autenticação e, mediante seu
                  consentimento, cookies de analytics e marketing. Você pode
                  personalizar a qualquer momento. Veja a{" "}
                  <Link
                    href="/politica-de-cookies"
                    className="text-lime hover:underline"
                  >
                    Política de Cookies
                  </Link>{" "}
                  e a{" "}
                  <Link
                    href="/politica-de-privacidade"
                    className="text-lime hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRejectAll}
                className="whitespace-nowrap"
              >
                Apenas essenciais
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="whitespace-nowrap"
              >
                Personalizar
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="whitespace-nowrap"
              >
                Aceitar todos
              </Button>
            </div>
            <button
              type="button"
              onClick={handleRejectAll}
              aria-label="Fechar (equivale a apenas essenciais)"
              className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground md:hidden"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <CookiePreferencesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={initial}
        onSave={handleSave}
      />
    </>
  );
}
