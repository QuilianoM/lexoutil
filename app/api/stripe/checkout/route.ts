import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const priceId = process.env.STRIPE_PRICE_ID || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secretKey.startsWith("sk_") || !priceId.startsWith("price_")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Stripe n’est pas encore configuré. Ajoutez STRIPE_SECRET_KEY et STRIPE_PRICE_ID dans .env.local.",
      },
      { status: 400 }
    );
  }

  const stripe = new Stripe(secretKey);

  // ✅ On récupère l'userId envoyé par le front
  let userId = "";
  try {
    const json = await req.json();
    userId = typeof json?.userId === "string" ? json.userId : "";
  } catch {}

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "userId manquant (identifiant local)." },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/paiement/cancel`,
      allow_promotion_codes: true,

      // ✅ très important : le webhook récupère cet id
      client_reference_id: userId,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          typeof e?.message === "string"
            ? e.message
            : "Erreur Stripe inconnue.",
      },
      { status: 500 }
    );
  }
}
