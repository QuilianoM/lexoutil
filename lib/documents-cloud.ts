// lib/documents-cloud.ts
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type CloudDocPayload = {
  templateId: string;
  templateLabel: string;
  objet: string;
  destinataire: string;
  snippet: string;
  content: string;
  form: Record<string, unknown>;
};

/**
 * Enregistre le document dans Supabase SI l'utilisateur est connecté.
 * - Retourne { saved: true } si sauvegardé en ligne
 * - Retourne { saved: false } si pas connecté (ou erreur) -> le local reste la source
 */
export async function saveDocumentToCloudIfLoggedIn(payload: CloudDocPayload): Promise<{
  saved: boolean;
  id?: string;
  reason?: string;
}> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return { saved: false, reason: "not_logged_in" };
    }

    const userId = userData.user.id;

    // ✅ important : on met un localId pour éviter les doublons côté DB
    // (le script SQL a un index unique sur form->_localId)
    const localId =
      typeof payload.form?._localId === "string"
        ? String(payload.form._localId)
        : `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const formWithLocalId = {
      ...payload.form,
      _localId: localId,
    };

    const row = {
      user_id: userId,
      template_id: payload.templateId,
      template_label: payload.templateLabel,
      objet: payload.objet,
      destinataire: payload.destinataire,
      snippet: payload.snippet,
      content: payload.content,
      form: formWithLocalId,
    };

    // Upsert "logique" : l'index unique empêche les doublons de sync.
    // Si déjà présent -> erreur unique possible selon config, on la considère comme "déjà sauvegardé".
    const { data, error } = await supabase
      .from("documents")
      .insert(row)
      .select("id")
      .maybeSingle();

    if (error) {
      // Cas probable : document déjà présent (unique index sur _localId)
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique")) {
        return { saved: true, reason: "already_saved" };
      }
      return { saved: false, reason: error.message || "insert_failed" };
    }

    return { saved: true, id: data?.id ?? undefined };
  } catch (e: any) {
    return { saved: false, reason: e?.message || "unknown_error" };
  }
}
