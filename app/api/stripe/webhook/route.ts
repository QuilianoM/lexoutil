import Stripe from "stripe";
import { NextResponse } from "next/server";
import { setUserPro } from "@/lib/server-pro-store";

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!secretKey.startsWith("sk_") || !webhookSecret.startsWith("whsec_")) {
    return NextResponse.json(
      { ok: false, error: "Webhook Stripe non configuré (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET)." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(secretKey);

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "En-tête stripe-signature manquant." }, { status: 400 });
  }

  // Stripe exige le body brut pour vérifier la signature
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Signature webhook invalide : " + (err?.message || "Erreur inconnue") },
      { status: 400 }
    );
  }

  try {
    // ✅ Quand l'abonnement est créé/actif
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // On a besoin d'un userId pour savoir qui activer :
      // → on va passer un client_reference_id dans Checkout (étape 4)
      const userId = session.client_reference_id;

      if (userId) {
        setUserPro(userId, "pro");
      }
    }

    // (Optionnel plus tard) gérer cancel / invoice payment failed, etc.

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erreur webhook inconnue." },
      { status: 500 }
    );
  }
}
