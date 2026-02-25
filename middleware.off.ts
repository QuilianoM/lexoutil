// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createSupabaseMiddlewareClient(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  return { supabase, res };
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/connexion";
  url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { supabase, res } = createSupabaseMiddlewareClient(req);

  // On récupère l'utilisateur via les cookies Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // ✅ Routes à protéger (tu peux en ajouter ensuite)
  const protectedRoutes = [
    "/compte",
    "/paiement",
    "/paiement/success",
    "/paiement/cancel",
  ];

  const isProtected = protectedRoutes.some((p) =>
    path === p || path.startsWith(p + "/")
  );

  // Si route protégée et pas connecté => redirection
  if (isProtected && !user) {
    return redirectToLogin(req);
  }

  // Important : on renvoie la réponse qui contient les cookies mis à jour si besoin
  return res;
}

// On évite de faire tourner le middleware sur les assets statiques
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
