// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/connexion";
  url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  // ✅ Ne jamais faire planter l’app si les env vars ne sont pas présentes
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si pas configuré => on laisse passer (pas de protection, mais site accessible)
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = req.nextUrl.pathname;

    const protectedRoutes = [
      "/compte",
      "/paiement",
      "/paiement/success",
      "/paiement/cancel",
    ];

    const isProtected = protectedRoutes.some(
      (p) => path === p || path.startsWith(p + "/")
    );

    if (isProtected && !user) {
      return redirectToLogin(req);
    }

    return res;
  } catch {
    // ✅ En cas de bug Supabase, on ne bloque pas l’app
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
