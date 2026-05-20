import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type BrowserSupabaseClient = SupabaseClient<any, any, any>;

let browserClient: BrowserSupabaseClient | null = null;
let sessionRecoveryPromise: Promise<void> | null = null;

function getSupabaseProjectRef() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return null;

  try {
    return new URL(supabaseUrl).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

function getSupabaseCookiePrefixes() {
  const projectRef = getSupabaseProjectRef();
  const prefixes = ["supabase.auth.token"];

  if (projectRef) {
    prefixes.push(`sb-${projectRef}-auth-token`);
  }

  return prefixes;
}

function isSupabaseAuthStorageKey(key: string) {
  const prefixes = getSupabaseCookiePrefixes();

  return prefixes.some(
    (prefix) =>
      key === prefix ||
      key.startsWith(`${prefix}.`) ||
      key.startsWith(`${prefix}-`),
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.toLowerCase();
  }

  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message.toLowerCase();
  }

  return "";
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return null;
}

export function clearSupabaseAuthCookies() {
  if (typeof document === "undefined") return;

  const cookieNames = document.cookie
    .split(";")
    .map((chunk) => chunk.trim().split("=")[0])
    .filter(Boolean);

  cookieNames.forEach((cookieName) => {
    if (!isSupabaseAuthStorageKey(cookieName)) return;

    document.cookie = `${cookieName}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  });
}

function clearSupabaseAuthStorageArea(storage?: Storage) {
  if (!storage) return;

  try {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);

      if (!key || !isSupabaseAuthStorageKey(key)) continue;

      storage.removeItem(key);
    }
  } catch {}
}

export function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;

  clearSupabaseAuthStorageArea(window.localStorage);
  clearSupabaseAuthStorageArea(window.sessionStorage);
}

export function clearSupabaseAuthState() {
  clearSupabaseAuthCookies();
  clearSupabaseAuthStorage();
}

export async function resetSupabaseBrowserSession(
  supabase: BrowserSupabaseClient | null = browserClient,
) {
  try {
    await supabase?.auth.signOut({ scope: "local" });
  } catch {}

  clearSupabaseAuthState();
  browserClient = null;
}

export function isRecoverableSupabaseSessionError(error: unknown) {
  const message = getErrorMessage(error);
  const status = getErrorStatus(error);

  return (
    message.includes("invalid refresh token") ||
    message.includes("refresh token not found") ||
    message.includes("auth session missing") ||
    message.includes("session not found") ||
    message.includes("session from session_id claim in jwt does not exist") ||
    (status === 400 && message.includes("refresh token")) ||
    (status === 403 && message.includes("refresh token"))
  );
}

export async function recoverSupabaseBrowserSession(
  supabase: BrowserSupabaseClient,
) {
  if (typeof window === "undefined") return;

  if (!sessionRecoveryPromise) {
    sessionRecoveryPromise = (async () => {
      await resetSupabaseBrowserSession(supabase);
    })();
  }

  try {
    await sessionRecoveryPromise;
  } finally {
    sessionRecoveryPromise = null;
  }
}

export async function getUserSafely(
  supabase: BrowserSupabaseClient,
): Promise<{
  user: User | null;
  error: Error | null;
  recovered: boolean;
}> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (!error) {
      return {
        user: data.user ?? null,
        error: null,
        recovered: false,
      };
    }

    if (isRecoverableSupabaseSessionError(error)) {
      await recoverSupabaseBrowserSession(supabase);
      return {
        user: null,
        error,
        recovered: true,
      };
    }

    return {
      user: null,
      error,
      recovered: false,
    };
  } catch (error) {
    const normalizedError =
      error instanceof Error
        ? error
        : new Error("Nao foi possivel validar a sessao.");

    if (isRecoverableSupabaseSessionError(normalizedError)) {
      await recoverSupabaseBrowserSession(supabase);
      return {
        user: null,
        error: normalizedError,
        recovered: true,
      };
    }

    return {
      user: null,
      error: normalizedError,
      recovered: false,
    };
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "O Supabase nao esta configurado. Crie um arquivo .env.local na raiz do projeto com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (veja .env.example).";

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(SUPABASE_NOT_CONFIGURED_MESSAGE);
    this.name = "SupabaseNotConfiguredError";
  }
}

export const createClient = () => {
  if (!isSupabaseConfigured()) {
    throw new SupabaseNotConfiguredError();
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    );
  }

  return browserClient;
};
