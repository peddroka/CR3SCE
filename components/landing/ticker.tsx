export function Ticker() {
  const items = [
    "CONTEÚDO PLANEJADO",
    "HORÁRIO DEFINIDO",
    "ROTEIRO PRONTO",
    "30 DIAS COMPLETOS",
    "VOCÊ SÓ POSTA",
    "SEU NEGÓCIO CRESCE",
  ];

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden whitespace-nowrap bg-lime py-3">
      <div className="flex animate-[ticker_20s_linear_infinite]">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="px-12 font-bebas text-sm tracking-widest text-[var(--lime-foreground)]"
          >
            {item} <span className="opacity-40">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
