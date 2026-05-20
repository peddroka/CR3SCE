// Gerencia preferencias de cookies do usuario no localStorage do navegador.
// Estrutura simples e versionada para permitir invalidar consentimentos
// quando a politica mudar materialmente.

import { CONSENT_BANNER_VERSION } from "./company";

export type ConsentCategories = {
  essential: true; // sempre true, nao desativavel
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = {
  version: string;
  acceptedAt: string; // ISO date
  categories: ConsentCategories;
};

export const CONSENT_STORAGE_KEY = "cr3sce_lgpd_consent";

export const DEFAULT_CONSENT: ConsentCategories = {
  essential: true,
  analytics: false,
  marketing: false,
};

export const FULL_CONSENT: ConsentCategories = {
  essential: true,
  analytics: true,
  marketing: true,
};

export function getStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_BANNER_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredConsent(categories: ConsentCategories) {
  if (typeof window === "undefined") return;
  const payload: StoredConsent = {
    version: CONSENT_BANNER_VERSION,
    acceptedAt: new Date().toISOString(),
    categories: { ...categories, essential: true },
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    // Notifica componentes da mesma aba (storage event so dispara entre abas)
    window.dispatchEvent(new CustomEvent("cr3sce:consent-changed", { detail: payload }));
  } catch {}
}

export function clearStoredConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cr3sce:consent-changed", { detail: null }));
  } catch {}
}
