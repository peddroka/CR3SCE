import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-6xl",
  };

  return (
    <span
      className={cn(
        "select-none leading-none tracking-[0.08em] font-[family-name:var(--font-bebas)]",
        sizes[size],
        className,
      )}
    >
      CR<span className="text-[#C8F135]">3</span>SCE
    </span>
  );
}
