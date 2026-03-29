import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { box: 28, text: "text-lg" },
    md: { box: 32, text: "text-xl" },
    lg: { box: 36, text: "text-2xl" },
    xl: { box: 44, text: "text-3xl" },
  };

  const s = sizes[size];

  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      {showText && (
        <span
          className={cn("font-bebas leading-none tracking-normal", s.text)}
          style={{ letterSpacing: "0.02em" }}
        >
          <span className="text-foreground">CR</span>
          <span className="text-primary">3</span>
          <span className="text-foreground">SCE</span>
        </span>
      )}
    </Link>
  );
}
