"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof HTMLElementTagNameMap;
}

/**
 * Lightweight replacement for framer-motion's whileInView.
 * Uses IntersectionObserver + CSS transitions (0KB JS library).
 */
export function AnimateOnScroll({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // @ts-expect-error dynamic tag
    <Tag
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

interface AnimateOnLoadProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Lightweight replacement for framer-motion's initial/animate.
 * Animates on mount with CSS transitions.
 */
export function AnimateOnLoad({
  children,
  className,
  delay = 0,
}: AnimateOnLoadProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        mounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
