import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secretKey.startsWith("sk_")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Stripe n’est pas configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local.",
      },
      { status: 400 }
    );
  }

  // ✅ utilisateur connecté
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json(
      { ok: false, error: "Vous devez être connecté." },
      { status: 401 }
    );
  }

  const userId = data.user.id;

  // ✅ récupérer le stripe_customer_id depuis ta table subscriptions
  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabaseAdmin = getSupabaseAdminClient();

  const { data: sub, error: subErr } = await (supabaseAdmin as any)
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (subErr) {
    return NextResponse.json(
      { ok: false, error: "Impossible de lire votre abonnement." },
      { status: 500 }
    );
  }

  const customerId = sub?.stripe_customer_id as string | null;

  if (!customerId || !String(customerId).startsWith("cus_")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Aucun client Stripe lié à ce compte. Effectuez d’abord un abonnement Pro.",
      },
      { status: 400 }
    );
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover" as any,
  });

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/compte`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          typeof e?.message === "string" ? e.message : "Erreur Portal inconnue.",
      },
      { status: 500 }
    );
  }
}
