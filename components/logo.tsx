import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  linkClassName?: string;
  href?: string;
  width?: number;
  height?: number;
}

export function Logo({
  linkClassName,
  href = "/",
  width = 120,
  height = 40,
}: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center", linkClassName)}>
      <Image
        src="/logo.png"
        alt="Cresci.AI"
        width={width}
        height={height}
        priority
        quality={100}
        className="object-contain"
      />
    </Link>
  );
}
