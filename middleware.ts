import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rotas que não precisam de auth — retorna imediatamente sem chamar Supabase
  if (
    pathname === "/" ||
    pathname.startsWith("/auth/") ||
    pathname === "/aguardando-pagamento" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next({ request });
  }

  // Só cria o client Supabase para rotas protegidas (/dashboard)
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }: {
              name: string;
              value: string;
              options?: CookieOptions;
            }) => supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (process.env.BYPASS_PAYMENT_GATE === "true") {
    return supabaseResponse;
  }

  if (pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("payment_status")
      .eq("id", user.id)
      .single();

    if (!profile || profile.payment_status !== "paid") {
      return NextResponse.redirect(
        new URL("/aguardando-pagamento", request.url),
      );
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match only routes that need protection.
     * Excludes: _next/static, _next/image, favicon, static assets, public pages
     */
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
};
