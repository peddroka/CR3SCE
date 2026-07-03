"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Campo suportado pela API /api/suggest-input */
  field:
    | "post_topic"
    | "post_tone"
    | "post_notes"
    | "image_prompt"
    | "brand_description";
  /** Valores atuais de outros inputs, usados como contexto pela IA */
  context?: Record<string, string>;
  /** Chamado quando o usuário escolhe uma sugestão */
  onPick: (text: string) => void;
  className?: string;
};

/**
 * Botão "Sugerir com IA" + chips de sugestão para inputs de escrita.
 * As sugestões seguem o padrão do perfil do negócio e dos demais campos.
 */
export function InputSuggestions({ field, context, onPick, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suggest-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, context }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Não foi possível sugerir agora.");
        return;
      }
      setSuggestions(data.suggestions || []);
    } catch {
      setError("Falha de conexão ao buscar sugestões.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => void fetchSuggestions()}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-medium text-lime transition-colors hover:bg-lime/20 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Sparkles className="size-3" />
        )}
        {suggestions.length > 0 ? "Sugerir outras" : "Sugerir com IA"}
      </button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="max-w-full rounded-lg border border-border bg-white/5 px-2.5 py-1.5 text-left text-xs leading-snug text-foreground transition-colors hover:border-lime/50 hover:bg-lime/5"
              title="Usar esta sugestão"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
