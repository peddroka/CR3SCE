"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Trash2, Bell, Tag, Gift } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Notice {
  id: string;
  title: string;
  description: string;
  link_url?: string;
  link_label?: string;
  notice_type?: string;
  promo_code?: string;
  active: boolean;
  created_at: string;
}

type NoticeType = "aviso" | "promocao" | "indicacao";

const TYPE_CONFIG = {
  aviso: {
    label: "Aviso Geral",
    icon: Bell,
    color: "text-[#C8F135]",
    bg: "bg-[#C8F135]/10 border-[#C8F135]/30",
    badge: "bg-[#C8F135]/20 text-[#C8F135]",
  },
  promocao: {
    label: "Promoção",
    icon: Tag,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-400",
  },
  indicacao: {
    label: "Código de Indicação",
    icon: Gift,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
    badge: "bg-purple-500/20 text-purple-400",
  },
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeType, setActiveType] = useState<NoticeType>("aviso");
  const [form, setForm] = useState({
    title: "",
    description: "",
    link_url: "",
    link_label: "",
    promo_code: "",
  });

  useEffect(() => {
    void loadNotices();
  }, []);

  const loadNotices = async () => {
    const res = await fetch("/api/admin/notices");
    const data = (await res.json()) as { notices?: Notice[] };
    setNotices(data.notices ?? []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    setSending(true);

    await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, notice_type: activeType }),
    });

    setForm({
      title: "",
      description: "",
      link_url: "",
      link_label: "",
      promo_code: "",
    });
    await loadNotices();
    setSending(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/notices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    await loadNotices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este aviso?")) return;
    await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    await loadNotices();
  };

  const config = TYPE_CONFIG[activeType];
  const TypeIcon = config.icon;

  return (
    <div className="min-h-screen bg-[#0e0e0e] p-6 text-white md:p-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-[#666] transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <Logo size="md" />
        </div>

        <h1 className="text-2xl font-bold text-white">
          Central de Comunicação
        </h1>

        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(TYPE_CONFIG) as [
            NoticeType,
            typeof TYPE_CONFIG.aviso,
          ][]).map(([type, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  activeType === type
                    ? cfg.bg
                    : "border-border bg-white/5 hover:bg-white/8"
                }`}
              >
                <Icon
                  className={`size-5 ${
                    activeType === type ? cfg.color : "text-[#666]"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    activeType === type ? cfg.color : "text-[#666]"
                  }`}
                >
                  {cfg.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className={`rounded-2xl border p-6 ${config.bg}`}>
          <div className="mb-5 flex items-center gap-2">
            <TypeIcon className={`size-5 ${config.color}`} />
            <h2
              className={`text-sm font-semibold uppercase tracking-wider ${config.color}`}
            >
              Novo {config.label}
            </h2>
          </div>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label className="text-[#c0c0c0]">Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={
                  activeType === "aviso"
                    ? "Ex: Nova funcionalidade disponível!"
                    : activeType === "promocao"
                      ? "Ex: 50% OFF no plano anual este fim de semana!"
                      : "Ex: Indique e ganhe 1 mês grátis!"
                }
                className="border-border bg-white/5 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#c0c0c0]">Descrição *</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder={
                  activeType === "aviso"
                    ? "Descreva o aviso em detalhes..."
                    : activeType === "promocao"
                      ? "Descreva a promoção, condições e prazo..."
                      : "Explique como funciona o programa de indicação..."
                }
                className="resize-none border-border bg-white/5 text-white"
                rows={3}
                required
              />
            </div>

            {activeType === "indicacao" && (
              <div className="space-y-2">
                <Label className="text-[#c0c0c0]">Código de Indicação</Label>
                <Input
                  value={form.promo_code}
                  onChange={(e) =>
                    setForm({ ...form, promo_code: e.target.value.toUpperCase() })
                  }
                  placeholder="Ex: AMIGO2026"
                  className="border-border bg-white/5 font-mono tracking-widest text-purple-400"
                />
              </div>
            )}

            {activeType === "promocao" && (
              <div className="space-y-2">
                <Label className="text-[#c0c0c0]">
                  Código Promocional (opcional)
                </Label>
                <Input
                  value={form.promo_code}
                  onChange={(e) =>
                    setForm({ ...form, promo_code: e.target.value.toUpperCase() })
                  }
                  placeholder="Ex: BLACK50"
                  className="border-border bg-white/5 font-mono tracking-widest text-orange-400"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#c0c0c0]">Link (opcional)</Label>
                <Input
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://..."
                  className="border-border bg-white/5 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#c0c0c0]">Texto do botão</Label>
                <Input
                  value={form.link_label}
                  onChange={(e) =>
                    setForm({ ...form, link_label: e.target.value })
                  }
                  placeholder="Ex: Aproveitar oferta"
                  className="border-border bg-white/5 text-white"
                />
              </div>
            </div>

            {(form.title || form.description) && (
              <div className="rounded-xl border border-border bg-[#0e0e0e] p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                  Preview
                </p>
                <p className="font-medium text-white">
                  {form.title || "Título do aviso"}
                </p>
                <p className="mt-1 text-sm text-[#888]">
                  {form.description || "Descrição..."}
                </p>
                {form.promo_code && (
                  <div className="mt-3 inline-block rounded-lg border border-dashed border-[#C8F135]/40 bg-[#C8F135]/5 px-4 py-2">
                    <p className="font-mono text-lg font-bold tracking-widest text-[#C8F135]">
                      {form.promo_code}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={sending}
              className="gap-2 bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020]"
            >
              <Send className="size-4" />
              {sending ? "Enviando..." : `Publicar ${config.label} para Todos`}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[#888]">
            Publicados ({notices.length})
          </h2>
          {loading ? (
            <p className="text-sm text-[#555]">Carregando...</p>
          ) : notices.length === 0 ? (
            <p className="text-sm text-[#555]">Nenhum aviso criado ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notices.map((notice) => {
                const type = (notice.notice_type as NoticeType) || "aviso";
                const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.aviso;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notice.id}
                    className="rounded-xl border border-border bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Icon className={`size-3.5 ${cfg.color}`} />
                          <p className="font-medium text-white">{notice.title}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.badge}`}
                          >
                            {cfg.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              notice.active
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {notice.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-[#888]">
                          {notice.description}
                        </p>
                        {notice.promo_code && (
                          <p className="mt-1 font-mono text-sm font-bold tracking-widest text-[#C8F135]">
                            {notice.promo_code}
                          </p>
                        )}
                        {notice.link_url && (
                          <p className="mt-1 text-[11px] text-[#C8F135]">
                            {notice.link_url}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => void handleToggle(notice.id, notice.active)}
                          className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                            notice.active
                              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                              : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {notice.active ? "Desativar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => void handleDelete(notice.id)}
                          className="flex size-8 items-center justify-center rounded-lg border border-border text-[#555] transition-colors hover:border-red-500/30 hover:text-red-400"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
