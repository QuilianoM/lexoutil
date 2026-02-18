import Stripe from "stripe";
import { NextResponse } from "next/server";
import { activateProForUserId, deactivateProForUserId } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!secretKey.startsWith("sk_") || !webhookSecret.startsWith("whsec_")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Webhook Stripe non configuré. Ajoutez STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET dans .env.local.",
      },
      { status: 400 }
    );
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover" as any,
  });

  const body = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: `Signature webhook invalide: ${err?.message || err}` },
      { status: 400 }
    );
  }

  try {
    // ✅ Paiement initial OK → activation Pro
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        session.metadata?.user_id || session.client_reference_id || "";

      if (userId) {
        await activateProForUserId(userId, {
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : undefined,
        });
      }
    }

    // ✅ Mise à jour d'abonnement (impayé, suspendu, réactivation, etc.)
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;

      const userId = sub.metadata?.user_id || "";
      if (userId) {
        const isActive = sub.status === "active" || sub.status === "trialing";

        // Stripe TS peut varier selon ta version : on lit en "safe"
        const currentPeriodEndSec = (sub as any)?.current_period_end as
          | number
          | undefined;

        if (isActive) {
          await activateProForUserId(userId, {
            stripeSubscriptionId: sub.id,
            currentPeriodEnd:
              typeof currentPeriodEndSec === "number"
                ? currentPeriodEndSec * 1000
                : null,
          });
        } else {
          await deactivateProForUserId(userId);
        }
      }
    }

    // ✅ Suppression / résiliation
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id || "";
      if (userId) {
        await deactivateProForUserId(userId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erreur webhook inconnue." },
      { status: 500 }
    );
  }
}
