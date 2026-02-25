import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const priceId = process.env.STRIPE_PRICE_ID || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secretKey.startsWith("sk_") || !priceId.startsWith("price_")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Stripe n’est pas configuré. Ajoutez STRIPE_SECRET_KEY et STRIPE_PRICE_ID dans .env.local.",
      },
      { status: 400 }
    );
  }

  // 1) utilisateur connecté (Supabase Auth via cookies)
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return NextResponse.json(
      { ok: false, error: "Vous devez être connecté pour vous abonner." },
      { status: 401 }
    );
  }

  const userId = data.user.id;

  // 2) Stripe
  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover" as any,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/paiement/cancel`,
      allow_promotion_codes: true,

      // ✅ Liaison fiable Supabase user id
      client_reference_id: userId,
      metadata: { user_id: userId },

      // ✅ Pour les events subscription.updated/deleted
      subscription_data: {
        metadata: { user_id: userId },
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          typeof e?.message === "string" ? e.message : "Erreur Stripe inconnue.",
      },
      { status: 500 }
    );
  }
}
