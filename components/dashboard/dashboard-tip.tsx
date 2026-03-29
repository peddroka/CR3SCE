"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function DashboardTip() {
  const [tip, setTip] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setTip(customEvent.detail.message);
    };

    window.addEventListener("show-tip", handler);
    return () => window.removeEventListener("show-tip", handler);
  }, []);

  return (
    <AnimatePresence>
      {tip && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={() => setTip(null)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[201] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-[#C8F135]/30 bg-card shadow-2xl">
              <div className="h-1 bg-[#C8F135]" />
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/10 text-2xl">
                    💡
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C8F135]">
                      Dica do CR3SCE
                    </p>
                    <p className="text-sm font-bold text-white">
                      Produtividade
                    </p>
                  </div>
                </div>
                <p className="mb-5 text-sm leading-relaxed text-[#888]">
                  {tip}
                </p>
                <button
                  onClick={() => setTip(null)}
                  className="w-full rounded-xl bg-[#C8F135] py-2.5 text-sm font-semibold text-[#111] transition-colors hover:bg-[#a8d020]"
                >
                  Entendi!
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
