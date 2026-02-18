// app/api/subscription/status/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  try {
    // 1) Qui est connecté ? (cookies)
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return NextResponse.json(
        { ok: false, error: "Non connecté." },
        { status: 401 }
      );
    }

    const userId = data.user.id;

    // 2) Lire le statut Pro dans subscriptions
    // On utilise admin (service role) pour être robuste (RLS ne bloque jamais le serveur)
    const admin = getSupabaseAdminClient();
    const { data: sub, error: subErr } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    if (subErr) {
      return NextResponse.json(
        { ok: false, error: "Impossible de vérifier l’abonnement." },
        { status: 500 }
      );
    }

    const pro = sub?.status === "pro";
    return NextResponse.json({ ok: true, pro });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erreur status" },
      { status: 500 }
    );
  }
}
