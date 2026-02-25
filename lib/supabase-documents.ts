import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type SupabaseDocumentRow = {
  id: string; // uuid
  user_id: string;
  created_at: string;

  template_id?: string | null;
  template_label?: string | null;

  objet?: string | null;
  destinataire?: string | null;
  snippet?: string | null;

  content?: string | null;
  form?: any; // jsonb
};

export type CreateDocumentInput = {
  template_id: string;
  template_label?: string;
  objet?: string;
  destinataire?: string;
  snippet?: string;
  content: string;
  form?: Record<string, unknown>;
};

async function requireUserId() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("Non connecté.");
  }
  return { supabase, userId: data.user.id };
}

function isUniqueViolation(err: any) {
  const msg = String(err?.message ?? "").toLowerCase();
  // Postgres unique violation / duplicate
  return msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505");
}

export async function createDocument(input: CreateDocumentInput) {
  const { supabase, userId } = await requireUserId();

  const payload = {
    user_id: userId,
    template_id: input.template_id,
    template_label: input.template_label ?? null,
    objet: input.objet ?? null,
    destinataire: input.destinataire ?? null,
    snippet: input.snippet ?? null,
    content: input.content,
    form: input.form ?? null,
  };

  const { data, error } = await supabase
    .from("documents")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error("Impossible d’enregistrer le document (Supabase).");
  }

  return data as SupabaseDocumentRow;
}

export async function listMyDocuments(limit = 200) {
  const { supabase } = await requireUserId();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Impossible de charger l’historique (Supabase).");
  }

  return (data ?? []) as SupabaseDocumentRow[];
}

export async function deleteDocumentById(id: string) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    throw new Error("Suppression impossible.");
  }

  return true;
}

/**
 * Synchronise un historique LOCAL vers Supabase.
 * - Utilise form._localId pour éviter les doublons (avec l’index unique conseillé).
 * - Ignore silencieusement les doublons.
 */
export async function syncLocalHistoryToCloud(
  items: Array<{
    id: string;
    templateId: string;
    templateLabel: string;
    objet: string;
    destinataire: string;
    snippet: string;
    form: Record<string, unknown>;
    content: string;
    createdAt: number;
  }>
) {
  const { supabase, userId } = await requireUserId();

  let created = 0;
  let skipped = 0;

  for (const it of items) {
    const payload = {
      user_id: userId,
      template_id: it.templateId,
      template_label: it.templateLabel ?? null,
      objet: it.objet ?? null,
      destinataire: it.destinataire ?? null,
      snippet: it.snippet ?? null,
      content: it.content ?? "",
      form: {
        ...(it.form ?? {}),
        _localId: it.id,
        _localCreatedAt: it.createdAt,
      },
    };

    const { error } = await supabase.from("documents").insert(payload);

    if (error) {
      if (isUniqueViolation(error)) {
        skipped++;
        continue;
      }
      // si autre erreur réseau/RLS/etc.
      throw new Error("Synchronisation impossible (Supabase).");
    }

    created++;
  }

  return { created, skipped };
}
