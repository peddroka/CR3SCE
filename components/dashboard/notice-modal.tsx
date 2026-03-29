"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Bell, Tag, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notice {
  id: string;
  title: string;
  description: string;
  link_url?: string;
  link_label?: string;
  notice_type?: "aviso" | "promocao" | "indicacao";
  promo_code?: string;
}

const TYPE_CONFIG = {
  aviso: {
    label: "Aviso CR3SCE",
    icon: Bell,
    border: "border-[#C8F135]/30 bg-[#C8F135]/10 text-[#C8F135]",
    codeBorder: "border-[#C8F135]/40 bg-[#C8F135]/5 text-[#C8F135]",
  },
  promocao: {
    label: "Promoção",
    icon: Tag,
    border: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    codeBorder: "border-orange-500/40 bg-orange-500/5 text-orange-400",
  },
  indicacao: {
    label: "Código de Indicação",
    icon: Gift,
    border: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    codeBorder: "border-purple-500/40 bg-purple-500/5 text-purple-400",
  },
} as const;

export function NoticeModal() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(false);

  const loadNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      const data = (await res.json()) as { notices?: Notice[] };
      if (data.notices && data.notices.length > 0) {
        setNotices(data.notices);
        setShow(true);
      }
    } catch {}
  };

  useEffect(() => {
    const handleShowNotices = () => {
      void loadNotices();
    };

    window.addEventListener("show-notices", handleShowNotices);
    return () => window.removeEventListener("show-notices", handleShowNotices);
  }, []);

  const dismiss = async (noticeId: string) => {
    try {
      await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notice_id: noticeId }),
      });
    } catch {}
  };

  const handleClose = async () => {
    const current = notices[currentIndex];
    if (current) await dismiss(current.id);

    if (currentIndex < notices.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShow(false);
    }
  };

  const current = notices[currentIndex];
  const type = current?.notice_type ?? "aviso";
  const config = TYPE_CONFIG[type];
  const TypeIcon = config.icon;

  return (
    <AnimatePresence>
      {show && current && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              void handleClose();
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-[#C8F135]" />

            <div className="p-6">
              {notices.length > 1 && (
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                  Aviso {currentIndex + 1} de {notices.length}
                </p>
              )}

              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 ${config.border}`}
              >
                <TypeIcon className="size-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {config.label}
                </span>
              </div>

              <h2 className="mb-3 text-xl font-bold text-white">
                {current.title}
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-[#888]">
                {current.description}
              </p>

              {current.promo_code && (
                <div
                  className={`mb-6 inline-block rounded-lg border border-dashed px-4 py-2 ${config.codeBorder}`}
                >
                  <p className="font-mono text-lg font-bold tracking-widest">
                    {current.promo_code}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {current.link_url && (
                  <a
                    href={current.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#C8F135]/30 bg-[#C8F135]/10 px-4 py-2.5 text-sm font-medium text-[#C8F135] transition-colors hover:bg-[#C8F135]/20"
                  >
                    <ExternalLink className="size-4" />
                    {current.link_label || "Ver mais"}
                  </a>
                )}
                <Button
                  onClick={() => {
                    void handleClose();
                  }}
                  className="flex-1 bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020]"
                >
                  {currentIndex < notices.length - 1 ? "Próximo" : "OK, entendi!"}
                </Button>
              </div>
            </div>

            <button
              onClick={() => {
                void handleClose();
              }}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[#555] transition-colors hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
