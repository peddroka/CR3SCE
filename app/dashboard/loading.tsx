import Image from "next/image";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-2 animate-pulse">
        <Image
          src="/logo.svg"
          alt="CR3SCE"
          width={59}
          height={44}
          priority
        />
        <span className="text-5xl leading-none tracking-[0.08em] font-[family-name:var(--font-bebas)]">
          CR<span className="text-[#C8F135]">3</span>SCE
        </span>
      </div>
      <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-full animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-[#C8F135] to-transparent" />
      </div>
    </div>
  );
}
