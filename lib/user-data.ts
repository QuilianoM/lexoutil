// Données utilisateur locales (Étape 7)
// Source unique : brouillon + historique + export/import + suppression.

export const DRAFT_STORAGE_KEY = "lexoutil_documents_draft_v1";
export const HISTORY_STORAGE_KEY = "lexoutil_documents_history_v1";

// Ces 2 clés existent déjà dans lib/subscription.ts.
// On les répète ici pour pouvoir tout effacer depuis /compte sans dépendance.
export const USER_ID_KEY = "lexoutil_user_id_v1";
export const SUB_STATUS_KEY = "lexoutil_sub_status_v1";

export const BACKUP_VERSION = 1;
export const HISTORY_MAX_ITEMS_DEFAULT = 30;

export type DraftPayload = {
  form: Record<string, unknown>;
  previewMode: "layout" | "text";
  savedAt: number;
};

export type HistoryItem = {
  id: string;
  createdAt: number;
  templateId: string;
  templateLabel: string;
  objet: string;
  destinataire: string;
  snippet: string;
  form: Record<string, unknown>;
};

export type BackupFile = {
  version: number;
  exportedAt: number;
  draft?: DraftPayload | null;
  history?: HistoryItem[] | null;
};

function safeJsonParse<T = any>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isPlainObject(x: any): x is Record<string, unknown> {
  return Boolean(x) && typeof x === "object" && !Array.isArray(x);
}

function isDraftPayload(x: any): x is DraftPayload {
  return (
    x &&
    typeof x === "object" &&
    isPlainObject(x.form) &&
    (x.previewMode === "layout" || x.previewMode === "text") &&
    typeof x.savedAt === "number"
  );
}

function isHistoryItem(x: any): x is HistoryItem {
  return (
    x &&
    typeof x === "object" &&
    typeof x.id === "string" &&
    typeof x.createdAt === "number" &&
    typeof x.templateId === "string" &&
    typeof x.templateLabel === "string" &&
    typeof x.objet === "string" &&
    typeof x.destinataire === "string" &&
    typeof x.snippet === "string" &&
    isPlainObject(x.form)
  );
}

/* -----------------------------
   Stats
------------------------------ */
export function getLocalDocumentsStats(): {
  hasDraft: boolean;
  draftSavedAt?: number;
  historyCount: number;
} {
  if (typeof window === "undefined") {
    return { hasDraft: false, historyCount: 0 };
  }

  const draftRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
  const histRaw = localStorage.getItem(HISTORY_STORAGE_KEY);

  const draft = safeJsonParse<any>(draftRaw);
  const parsedHistory = safeJsonParse<any>(histRaw);

  const hasDraft = isDraftPayload(draft);
  const draftSavedAt = hasDraft ? draft.savedAt : undefined;

  const historyCount = Array.isArray(parsedHistory)
    ? parsedHistory.filter(isHistoryItem).length
    : 0;

  return { hasDraft, draftSavedAt, historyCount };
}

/* -----------------------------
   Brouillon (draft)
------------------------------ */
export function loadDraft(): DraftPayload | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
  const parsed = safeJsonParse<any>(raw);
  return isDraftPayload(parsed) ? parsed : null;
}

export function saveDraft(payload: DraftPayload) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {}
}

/* -----------------------------
   Historique
------------------------------ */
export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
  const parsed = safeJsonParse<any>(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isHistoryItem);
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function addToHistory(item: HistoryItem, maxItems = HISTORY_MAX_ITEMS_DEFAULT) {
  const current = loadHistory();
  const next = [item, ...current].slice(0, maxItems);
  saveHistory(next);
}

export function clearHistory() {
  saveHistory([]);
}

/* -----------------------------
   Export / Import (backup)
------------------------------ */
export function exportUserBackup(): BackupFile {
  if (typeof window === "undefined") {
    return { version: BACKUP_VERSION, exportedAt: Date.now(), draft: null, history: [] };
  }

  const draft = loadDraft();
  const history = loadHistory();

  return {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    draft,
    history,
  };
}

export function downloadBackupFile() {
  if (typeof window === "undefined") return;

  const backup = exportUserBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = `lexoutil-sauvegarde_${new Date().toISOString().slice(0, 10)}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importUserBackupFromText(
  text: string,
  options?: { mergeHistory?: boolean }
): { importedDraft: boolean; importedHistoryCount: number } {
  if (typeof window === "undefined") {
    return { importedDraft: false, importedHistoryCount: 0 };
  }

  const parsed = safeJsonParse<any>(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Fichier non reconnu.");
  }

  const incomingDraft = parsed.draft && isDraftPayload(parsed.draft) ? parsed.draft : null;
  const incomingHistory = Array.isArray(parsed.history)
    ? (parsed.history as any[]).filter(isHistoryItem)
    : [];

  const merge = options?.mergeHistory !== false;

  // Historique
  if (merge) {
    const currentItems = loadHistory();

    // Déduplication par id, garde le plus récent
    const map = new Map<string, HistoryItem>();
    for (const it of [...currentItems, ...incomingHistory]) {
      const existing = map.get(it.id);
      if (!existing || it.createdAt > existing.createdAt) map.set(it.id, it);
    }

    const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    saveHistory(merged);
  } else {
    saveHistory(incomingHistory);
  }

  // Brouillon
  if (incomingDraft) {
    saveDraft(incomingDraft);
  }

  return {
    importedDraft: Boolean(incomingDraft),
    importedHistoryCount: incomingHistory.length,
  };
}

/* -----------------------------
   Suppression totale (privacy)
------------------------------ */
export function clearAllLocalUserData() {
  if (typeof window === "undefined") return;
  const keys = [DRAFT_STORAGE_KEY, HISTORY_STORAGE_KEY, USER_ID_KEY, SUB_STATUS_KEY];
  for (const k of keys) {
    try {
      localStorage.removeItem(k);
    } catch {}
  }
}
