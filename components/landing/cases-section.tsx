"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate";

const cases = [
  {
    id: "napoli",
    emoji: "🍕",
    bg: "from-[#2a1000] to-[#5a2800]",
    tag: "Alimentação — São Paulo, SP",
    name: "Pizzaria Napoli",
    result: "De 312 para 4.100 seguidores em 90 dias",
    before: "312 seg.",
    after: "4.1k seg.",
    stats: [
      { num: "312", label: "Seguidores antes" },
      { num: "4.100", label: "Seguidores hoje" },
      { num: "90 dias", label: "Com CR3SCE" },
    ],
    intro:
      "A Pizzaria Napoli estava há 3 anos no Instagram sem crescer. Postava esporadicamente, sem estratégia, e o engajamento era quase zero.",
    timeline: [
      { period: "MÊS 1", text: "Engajamento subiu 180% na primeira semana com os bastidores da cozinha." },
      { period: "MÊS 2", text: "Primeiro reels viralizou: 28 mil visualizações e 800 novos seguidores em um fim de semana." },
      { period: "MÊS 3", text: "4.100 seguidores e fila no delivery. Marco precisou contratar mais um entregador." },
    ],
  },
  {
    id: "estrela",
    emoji: "🛒",
    bg: "from-[#001a2a] to-[#003050]",
    tag: "Comércio — Recife, PE",
    name: "Mercado Estrela",
    result: "De 89 para 2.800 seguidores em 60 dias",
    before: "89 seg.",
    after: "2.8k seg.",
    stats: [
      { num: "89", label: "Seguidores antes" },
      { num: "2.800", label: "Seguidores hoje" },
      { num: "60 dias", label: "Com CR3SCE" },
    ],
    intro: "Roberto tinha um mercadinho com 89 seguidores. Em 60 dias o Mercado Estrela virou referência no bairro.",
    timeline: [
      { period: "MÊS 1", text: "Ofertas semanais toda sexta-feira geraram um ritual — clientes esperam o post pra fazer a lista de compras." },
      { period: "MÊS 2", text: "2.800 seguidores e clientes de bairros vizinhos. Roberto estendeu o horário pra dar conta." },
    ],
  },
  {
    id: "beleza",
    emoji: "💇",
    bg: "from-[#2a001a] to-[#500030]",
    tag: "Beleza — Fortaleza, CE",
    name: "Beleza Pura",
    result: "Agenda lotada em 45 dias",
    before: "540 seg.",
    after: "6.2k seg.",
    stats: [
      { num: "540", label: "Seguidores antes" },
      { num: "6.200", label: "Seguidores hoje" },
      { num: "45 dias", label: "Pra lotar agenda" },
    ],
    intro: "Juliana tinha um salão com boa estrutura mas a agenda ficava vazia. Em 45 dias com o CR3SCE, lotou os horários do mês inteiro.",
    timeline: [
      { period: "SEM 1-2", text: "Antes e depois de cada cliente. O engajamento explodiu." },
      { period: "SEM 3-4", text: "Stories de agenda aberta geraram corrida pra agendar." },
      { period: "MÊS 2", text: "6.200 seguidores e lista de espera. Contratou mais uma profissional." },
    ],
  },
  {
    id: "studiofit",
    emoji: "🏋️",
    bg: "from-[#001a10] to-[#003020]",
    tag: "Fitness — Belo Horizonte, MG",
    name: "Studio Fit BH",
    result: "12 novos alunos no mês 1",
    before: "210 seg.",
    after: "3.5k seg.",
    stats: [
      { num: "210", label: "Seguidores antes" },
      { num: "3.500", label: "Seguidores hoje" },
      { num: "12", label: "Alunos no mês 1" },
    ],
    intro: "Carlos tinha um studio de musculação mas ninguém sabia disso. Com o CR3SCE, o studio virou referência em BH.",
    timeline: [
      { period: "MÊS 1", text: "Conteúdo educativo sobre treino correto. 12 novos alunos vieram direto do Instagram." },
      { period: "MÊS 2-3", text: "Carlos passou a ser chamado pra podcasts e lives. Autoridade construída." },
    ],
  },
  {
    id: "padaria",
    emoji: "🥐",
    bg: "from-[#2a2000] to-[#4a3800]",
    tag: "Alimentação — Curitiba, PR",
    name: "Padaria Nova Aurora",
    result: "Fila na porta após viral",
    before: "180 seg.",
    after: "5.7k seg.",
    stats: [
      { num: "180", label: "Seguidores antes" },
      { num: "5.700", label: "Seguidores hoje" },
      { num: "1 post", label: "Pra viralizar" },
    ],
    intro: "Paulo tinha uma padaria de 20 anos mas nenhuma presença digital. Um post viralizou e mudou tudo.",
    timeline: [
      { period: "MÊS 1", text: "Bastidores da produção geraram conexão emocional. 20 anos de história que as pessoas queriam conhecer." },
      { period: "SEMANA 6", text: "Vídeo do Paulo às 4h da manhã: 180 mil views. 2.400 novos seguidores em 48h." },
      { period: "MÊS 3", text: "Fila na calçada toda manhã. Paulo planeja abrir segunda unidade." },
    ],
  },
  {
    id: "clinica",
    emoji: "🦷",
    bg: "from-[#0a001a] to-[#1a0030]",
    tag: "Saúde — Salvador, BA",
    name: "Clínica Sorriso",
    result: "Lista de espera de 3 semanas",
    before: "420 seg.",
    after: "8.3k seg.",
    stats: [
      { num: "420", label: "Seguidores antes" },
      { num: "8.300", label: "Seguidores hoje" },
      { num: "3 sem.", label: "Lista de espera" },
    ],
    intro: "Dra. Fernanda tinha uma clínica com bom atendimento mas agenda com buracos. Em 4 meses, lista de espera de 3 semanas.",
    timeline: [
      { period: "MÊS 1-2", text: "Conteúdo educativo — dicas, mitos e verdades. Engajamento +400%." },
      { period: "MÊS 3", text: "Depoimentos reais geraram onda de indicações de toda Salvador." },
      { period: "MÊS 4", text: "Lista de espera 3 semanas. Abriu agenda para segundo dentista." },
    ],
  },
];

export function CasesSection() {
  const [selected, setSelected] = useState<(typeof cases)[0] | null>(null);

  return (
    <section
      className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-32 lg:px-16 lg:py-40"
    >
      <AnimateOnScroll className="mb-14 md:mb-20">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          Casos Reais
        </p>
        <h2 className="font-bebas text-[clamp(36px,5vw,72px)] leading-tight">
          CLIQUE E VEJA
          <br />O QUANTO <span className="text-lime">CRESCERAM.</span>
        </h2>
      </AnimateOnScroll>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => (
          <AnimateOnScroll
            key={c.id}
            delay={i * 80}
            className="cursor-pointer overflow-hidden border border-border bg-card transition-all hover:-translate-y-1 hover:border-[#C8F135]/40"
          >
            <div onClick={() => setSelected(c)}>
              <div
                className={`bg-gradient-to-br ${c.bg} relative aspect-video flex items-center justify-center`}
              >
                <span className="relative z-10 text-5xl">{c.emoji}</span>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                  <span className="rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[10px] text-muted-foreground">
                    {c.before}
                  </span>
                  <span className="rounded-full border border-[#C8F135]/40 bg-[#C8F135]/20 px-2 py-1 text-[10px] text-lime">
                    {c.after}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-lime">
                  {c.tag}
                </p>
                <h3 className="mb-1 font-bebas text-xl">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.result}</p>
                <p className="mt-3 text-xs font-medium text-lime">
                  Ver crescimento completo →
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-card animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border p-6 md:p-8">
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-lime">
                  {selected.tag}
                </p>
                <h2 className="font-bebas text-3xl">{selected.name}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 md:p-8">
              <div className="mb-8 grid grid-cols-3 gap-px bg-border">
                {selected.stats.map((s, i) => (
                  <div key={i} className="bg-secondary p-3 text-center md:p-5">
                    <p className="font-bebas text-2xl text-lime md:text-3xl">{s.num}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {selected.intro}
              </p>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                LINHA DO TEMPO
              </p>
              <div className="flex flex-col gap-4">
                {selected.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="mt-0.5 min-w-[56px] font-bebas text-xs tracking-wider text-lime">
                      {t.period}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
