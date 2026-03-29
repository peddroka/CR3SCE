"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface AdminModalsProps {
  data: {
    paidUsers: { email: string; id: string }[];
    usersHoje: { email: string; created_at: string }[];
    usersOntem: { email: string; created_at: string }[];
    usersSemana: { email: string; created_at: string }[];
    usersMes: { email: string; created_at: string }[];
    usersAno: { email: string; created_at: string }[];
    totalUsers: number;
    paidCount: number;
    businessCount: number;
    strategyCount: number;
    conversao: string;
    cadastrosHoje: number;
    cadastrosOntem: number;
    cadastrosSemana: number;
    cadastrosMes: number;
    cadastrosAno: number;
  };
}

type ModalType =
  | "pagos"
  | "hoje"
  | "ontem"
  | "semana"
  | "mes"
  | "ano"
  | "total"
  | "negocios"
  | "estrategias"
  | null;

export function AdminModals({ data }: AdminModalsProps) {
  const [modal, setModal] = useState<ModalType>(null);

  const modalContent: Record<
    string,
    { title: string; users: { email: string; created_at?: string }[] }
  > = {
    pagos: { title: "Assinantes Pagos", users: data.paidUsers },
    hoje: { title: "Cadastros Hoje", users: data.usersHoje },
    ontem: { title: "Cadastros Ontem", users: data.usersOntem },
    semana: { title: "Últimos 7 dias", users: data.usersSemana },
    mes: { title: "Este Mês", users: data.usersMes },
    ano: { title: "Este Ano", users: data.usersAno },
  };

  const statCards = [
    { label: "Total de contas", value: data.totalUsers, color: "text-white", modal: "total" as ModalType },
    { label: "Assinantes pagos", value: data.paidCount, color: "text-[#C8F135]", modal: "pagos" as ModalType },
    { label: "Negócios cadastrados", value: data.businessCount, color: "text-white", modal: "negocios" as ModalType },
    { label: "Estratégias geradas", value: data.strategyCount, color: "text-blue-400", modal: "estrategias" as ModalType },
    { label: "Conversão", value: data.conversao, color: "text-[#C8F135]", modal: null },
  ];

  const periodCards = [
    { label: "Hoje", value: data.cadastrosHoje, modal: "hoje" as ModalType },
    { label: "Ontem", value: data.cadastrosOntem, modal: "ontem" as ModalType },
    { label: "Últimos 7 dias", value: data.cadastrosSemana, modal: "semana" as ModalType },
    { label: "Este mês", value: data.cadastrosMes, modal: "mes" as ModalType },
    { label: "Este ano", value: data.cadastrosAno, modal: "ano" as ModalType },
  ];

  const currentModal = modal && modalContent[modal];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {statCards.map((stat) => (
          <button
            key={stat.label}
            onClick={() => stat.modal && setModal(stat.modal)}
            className={`rounded-xl border border-border bg-card p-5 text-left transition-all ${
              stat.modal ? "cursor-pointer hover:border-[#C8F135]/30" : "cursor-default"
            }`}
          >
            <p className="mb-2 text-[10px] uppercase tracking-wider text-[#555]">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            {stat.modal && <p className="mt-1 text-[10px] text-[#555]">clique para ver →</p>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {periodCards.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setModal(stat.modal)}
            className="cursor-pointer rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-[#C8F135]/30"
          >
            <p className="mb-1 text-[10px] uppercase tracking-wider text-[#555]">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-[#555]">cadastros</p>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {modal && currentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-[#0e0e0e] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{currentModal.title}</h3>
                  <p className="text-xs text-[#555]">{currentModal.users.length} usuários</p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#555] hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                {currentModal.users.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#555]">Nenhum usuário neste período</p>
                ) : (
                  currentModal.users.map((user, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-white/5 px-3 py-2"
                    >
                      <p className="text-sm text-white">{user.email}</p>
                      {user.created_at && (
                        <p className="text-[11px] text-[#555]">
                          {new Date(user.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
