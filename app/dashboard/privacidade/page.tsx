"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Cookie,
  Download,
  FileEdit,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConsentRow = {
  type: string;
  version: string;
  granted: boolean;
  granted_at: string;
  revoked_at: string | null;
  created_at: string;
};

type DeletionRequest = {
  id: string;
  requested_at: string;
  scheduled_for: string;
  status: string;
  reason: string | null;
};

const CONSENT_LABELS: Record<string, string> = {
  privacy_policy: "Politica de Privacidade",
  terms_of_use: "Termos de Uso",
  marketing_emails: "E-mails de marketing",
  cookies_analytics: "Cookies de analytics",
  cookies_marketing: "Cookies de marketing",
  ai_processing: "Processamento por IA",
};

export default function PrivacidadePage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [current, setCurrent] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<ConsentRow[]>([]);
  const [deletion, setDeletion] = useState<DeletionRequest | null>(null);
  const [deletionReason, setDeletionReason] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [consentRes, deletionRes] = await Promise.all([
        fetch("/api/lgpd/consent", { cache: "no-store" }),
        fetch("/api/lgpd/delete", { cache: "no-store" }),
      ]);

      if (consentRes.ok) {
        const data = await consentRes.json();
        setCurrent(data.current ?? {});
        setHistory(data.history ?? []);
      }

      if (deletionRes.ok) {
        const data = await deletionRes.json();
        setDeletion(data.request ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateConsent(type: string, granted: boolean) {
    setBusy(type);
    try {
      const res = await fetch("/api/lgpd/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: [{ type, granted }] }),
      });
      if (!res.ok) throw new Error("falha");
      toast.success(granted ? "Consentimento registrado" : "Consentimento revogado");
      await refresh();
    } catch {
      toast.error("Nao foi possivel atualizar.");
    } finally {
      setBusy(null);
    }
  }

  async function exportData() {
    setBusy("export");
    try {
      const res = await fetch("/api/lgpd/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cr3sce-meus-dados-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Download iniciado.");
    } catch {
      toast.error("Nao foi possivel exportar.");
    } finally {
      setBusy(null);
    }
  }

  async function requestDeletion() {
    setBusy("delete");
    try {
      const res = await fetch("/api/lgpd/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deletionReason || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success("Solicitacao registrada. Voce tem 30 dias para cancelar.");
      setDeletionReason("");
      await refresh();
    } catch {
      toast.error("Nao foi possivel solicitar a exclusao.");
    } finally {
      setBusy(null);
    }
  }

  async function cancelDeletion() {
    setBusy("cancel");
    try {
      const res = await fetch("/api/lgpd/delete", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Solicitacao de exclusao cancelada.");
      await refresh();
    } catch {
      toast.error("Nao foi possivel cancelar.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-lime" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-12"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-7 text-lime" />
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Privacidade e meus dados
          </h1>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Aqui voce exerce os direitos previstos no Art. 18 da LGPD: acessar,
          corrigir, portar, revogar consentimentos e excluir sua conta. Veja
          tambem a{" "}
          <Link
            href="/politica-de-privacidade"
            target="_blank"
            className="text-lime hover:underline"
          >
            Politica de Privacidade
          </Link>
          .
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <Download className="size-5 text-lime" />
              <h2 className="text-base font-semibold text-foreground">
                Solicitar meus dados
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Baixe um arquivo JSON com todos os dados que armazenamos sobre
              voce: cadastro, perfil do negocio, estrategias, consentimentos e
              logs de auditoria.
            </p>
            <Button
              onClick={exportData}
              disabled={busy === "export"}
              className="w-fit"
            >
              {busy === "export" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Baixar meus dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <FileEdit className="size-5 text-lime" />
              <h2 className="text-base font-semibold text-foreground">
                Corrigir dados
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Atualize informacoes do seu negocio, perfil e preferencias na
              area de configuracoes.
            </p>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/dashboard/settings">Ir para configuracoes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <Cookie className="size-5 text-lime" />
              <h2 className="text-base font-semibold text-foreground">
                Cookies
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Revise quais categorias de cookies voce permite.
            </p>
            <Button
              variant="outline"
              className="w-fit"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("cr3sce:open-cookie-prefs"))
              }
            >
              Gerenciar cookies
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-lime" />
              <h2 className="text-base font-semibold text-foreground">
                E-mails de marketing
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {current.marketing_emails
                ? "Voce esta recebendo nossos e-mails."
                : "Voce nao recebe e-mails de marketing."}
            </p>
            <div className="flex items-center gap-3">
              <Switch
                checked={current.marketing_emails === true}
                disabled={busy === "marketing_emails"}
                onCheckedChange={(checked) =>
                  updateConsent("marketing_emails", checked === true)
                }
              />
              <span className="text-sm text-muted-foreground">
                Quero receber novidades e ofertas
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-destructive" />
              <h2 className="text-base font-semibold text-foreground">
                Excluir minha conta
              </h2>
            </div>
            {deletion ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Voce solicitou a exclusao em{" "}
                  <strong className="text-foreground">
                    {new Date(deletion.requested_at).toLocaleDateString("pt-BR")}
                  </strong>
                  . A conta sera permanentemente excluida em{" "}
                  <strong className="text-foreground">
                    {new Date(deletion.scheduled_for).toLocaleDateString("pt-BR")}
                  </strong>
                  . Voce pode cancelar antes dessa data.
                </p>
                <Button
                  variant="outline"
                  onClick={cancelDeletion}
                  disabled={busy === "cancel"}
                  className="w-fit"
                >
                  {busy === "cancel" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Cancelar solicitacao
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  A exclusao apaga sua conta, perfil, conteudos gerados e
                  consentimentos. Mantemos somente o estritamente necessario
                  para obrigacoes legais (ex. dados fiscais por 5 anos).
                  Apos confirmar, voce tem 30 dias para se arrepender.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-fit">
                      <Trash2 className="size-4" />
                      Solicitar exclusao
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sua conta sera agendada para exclusao em 30 dias. Voce
                        pode contar (opcional) o motivo para nos ajudar a
                        melhorar:
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <textarea
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Motivo (opcional)"
                      className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-foreground outline-none focus:border-lime"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={requestDeletion}
                        disabled={busy === "delete"}
                      >
                        {busy === "delete" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        Confirmar exclusao
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Historico de consentimentos
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum registro ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 pr-4">Tipo</th>
                      <th className="py-2 pr-4">Versao</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, idx) => (
                      <tr
                        key={`${row.type}-${row.created_at}-${idx}`}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-3 pr-4 text-foreground">
                          {CONSENT_LABELS[row.type] ?? row.type}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {row.version}
                        </td>
                        <td className="py-3 pr-4">
                          {row.granted ? (
                            <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs text-lime">
                              Concedido
                            </span>
                          ) : (
                            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">
                              Revogado
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(row.created_at).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
