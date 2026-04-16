import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const heights = {
    sm: 24,
    md: 32,
    lg: 44,
    xl: 56,
  };

  const h = heights[size];
  const w = Math.round(h * (581.59 / 433.61));

  const textSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-6xl",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 select-none", className)}>
      <Image
        src="/logo.svg"
        alt="CR3SCE"
        width={w}
        height={h}
        className="shrink-0"
        priority
      />
      <span
        className={cn(
          "translate-y-[0.05em] leading-[1] tracking-[0.08em] font-[family-name:var(--font-bebas)]",
          textSizes[size],
        )}
      >
        CR<span className="text-[#C8F135]">3</span>SCE
      </span>
    </span>
  );
}
