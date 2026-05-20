import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
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
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 🏠 Rotas PÚBLICAS
  const publicRoutes = ["/", "/landing", "/landing/", "/landing/pricing"];

  // 🔐 Rotas de AUTENTICAÇÃO
  const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/callback",
  ];

  // 🛡️ Rotas PROTEGIDAS
  const protectedRoutes = [
    "/dashboard",
    "/onboarding",
    "/profile",
    "/settings",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Landing page - sempre acessível
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Não logado tentando acessar rota protegida -> vai pra landing
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  // Não logado em rotas de auth -> permite
  if (!user && isAuthRoute) {
    return supabaseResponse;
  }

  // Logado tentando acessar auth -> vai pro dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Logado tentando acessar landing -> vai pro dashboard
  if (user && pathname.startsWith("/landing")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Verificar onboarding para rotas do dashboard
  if (user && pathname.startsWith("/dashboard")) {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("onboarding_complete")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const business = businesses?.[0];

    if (!business?.onboarding_complete && !pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
