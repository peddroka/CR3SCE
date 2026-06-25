"use client";

export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cr3sce:open-cookie-prefs"));
        }
      }}
      className={
        className ??
        "w-fit text-left text-sm text-muted-foreground transition-colors hover:text-lime"
      }
    >
      Preferências de cookies
    </button>
  );
}
