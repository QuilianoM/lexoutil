// lib/subscription.ts

export type ActivateProPayload = {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string | number | null; // timestamp ms ou ISO
};

export const SUB_STATUS_KEY = "lexoutil_sub_status_v1";
export const USER_ID_KEY = "lexoutil_user_id_v1";

type LegacyStatusString = "pro" | "free";

export type SubscriptionStatus = {
  pro: boolean | null;
  checkedAt: number | null;
};

function safeParseStatus(raw: string | null): SubscriptionStatus {
  const fallback: SubscriptionStatus = { pro: null, checkedAt: null };
  if (!raw) return fallback;

  try {
    const obj = JSON.parse(raw) as any;
    if (obj && typeof obj === "object") {
      const pro =
        typeof obj.pro === "boolean" ? obj.pro : obj.pro === null ? null : null;
      const checkedAt = typeof obj.checkedAt === "number" ? obj.checkedAt : null;
      return { pro, checkedAt };
    }
  } catch {}

  const legacy = raw as LegacyStatusString;
  if (legacy === "pro") return { pro: true, checkedAt: Date.now() };
  if (legacy === "free") return { pro: false, checkedAt: Date.now() };

  return fallback;
}

export function getSubscriptionStatus(): SubscriptionStatus {
  if (typeof window === "undefined") return { pro: null, checkedAt: null };

  try {
    const raw = localStorage.getItem(SUB_STATUS_KEY);
    const parsed = safeParseStatus(raw);

    if (raw === "pro" || raw === "free") {
      try {
        localStorage.setItem(SUB_STATUS_KEY, JSON.stringify(parsed));
      } catch {}
    }

    return parsed;
  } catch {
    return { pro: null, checkedAt: null };
  }
}

export function setSubscriptionStatus(pro: boolean) {
  if (typeof window === "undefined") return;
  const payload: SubscriptionStatus = { pro, checkedAt: Date.now() };
  try {
    localStorage.setItem(SUB_STATUS_KEY, JSON.stringify(payload));
  } catch {}
}

export function isPro(): boolean {
  return getSubscriptionStatus().pro === true;
}

export async function refreshProStatus(): Promise<{
  ok: boolean;
  pro: boolean;
  checkedAt: number;
  error?: string;
}> {
  const checkedAt = Date.now();

  if (typeof window === "undefined") {
    return { ok: false, pro: false, checkedAt, error: "client_only" };
  }

  try {
    const res = await fetch("/api/subscription/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => ({} as any));
    const pro = Boolean(data?.pro);

    if (!res.ok || data?.ok !== true) {
      return {
        ok: false,
        pro: false,
        checkedAt,
        error: typeof data?.error === "string" ? data.error : "status_failed",
      };
    }

    setSubscriptionStatus(pro);
    return { ok: true, pro, checkedAt };
  } catch (e: any) {
    return {
      ok: false,
      pro: false,
      checkedAt,
      error: e?.message || "network_error",
    };
  }
}

export async function refreshProStatusFromServer(_userId?: string) {
  return refreshProStatus();
}

/**
 * ✅ Active Pro côté serveur (Stripe webhook)
 * - Met à jour subscriptions + user_entitlements (pour RLS)
 */
export async function activateProForUserId(
  userId: string,
  stripe?: ActivateProPayload
) {
  if (!userId) return;

  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabaseAdmin = getSupabaseAdminClient();

  const currentPeriodEnd =
    stripe?.currentPeriodEnd == null
      ? null
      : typeof stripe.currentPeriodEnd === "number"
      ? new Date(stripe.currentPeriodEnd).toISOString()
      : typeof stripe.currentPeriodEnd === "string"
      ? stripe.currentPeriodEnd
      : null;

  // ✅ subscriptions (ton système)
  const payload = {
    user_id: userId,
    status: "pro",
    updated_at: new Date().toISOString(),
    stripe_customer_id: stripe?.stripeCustomerId ?? null,
    stripe_subscription_id: stripe?.stripeSubscriptionId ?? null,
    current_period_end: currentPeriodEnd,
  };

  const { error } = await (supabaseAdmin as any)
    .from("subscriptions")
    .upsert(payload as any, { onConflict: "user_id" } as any);

  if (error) {
    throw new Error("Impossible d’activer Pro (Supabase).");
  }

  // ✅ user_entitlements (pour RLS)
  const { error: entErr } = await (supabaseAdmin as any)
    .from("user_entitlements")
    .upsert(
      {
        user_id: userId,
        is_pro: true,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "user_id" } as any
    );

  if (entErr) {
    throw new Error("Pro activé, mais entitlement non mis à jour (RLS).");
  }
}

/**
 * ✅ Désactive Pro côté serveur (Stripe webhook)
 * - Met à jour subscriptions + user_entitlements (pour RLS)
 */
export async function deactivateProForUserId(userId: string) {
  if (!userId) return;

  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabaseAdmin = getSupabaseAdminClient();

  const payload = {
    user_id: userId,
    status: "free",
    updated_at: new Date().toISOString(),
    current_period_end: null,
  };

  const { error } = await (supabaseAdmin as any)
    .from("subscriptions")
    .upsert(payload as any, { onConflict: "user_id" } as any);

  if (error) {
    throw new Error("Impossible de désactiver Pro (Supabase).");
  }

  const { error: entErr } = await (supabaseAdmin as any)
    .from("user_entitlements")
    .upsert(
      {
        user_id: userId,
        is_pro: false,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "user_id" } as any
    );

  if (entErr) {
    throw new Error("Pro désactivé, mais entitlement non mis à jour (RLS).");
  }
}

export async function isProForUserId(userId: string): Promise<boolean> {
  if (!userId) return false;

  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabaseAdmin = getSupabaseAdminClient();

  const { data, error } = await (supabaseAdmin as any)
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;
  return data?.status === "pro";
}
