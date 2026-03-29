import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const bypassPaymentGate = process.env.BYPASS_PAYMENT_GATE === "true";
  const pathname = request.nextUrl.pathname;

  const fullyPublicRoutes = [
    "/",
    "/auth/login",
    "/auth/sign-up",
    "/auth/error",
    "/auth/sign-up-success",
    "/aguardando-pagamento",
    "/admin",
    "/admin/login",
  ];

  const isFullyPublic =
    fullyPublicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/cakto") ||
    pathname.startsWith("/api/");

  if (isFullyPublic) {
    return NextResponse.next({ request });
  }

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

  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (bypassPaymentGate) {
    return supabaseResponse;
  }

  if (user && pathname.startsWith("/dashboard")) {
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)$).*)",
  ],
};
