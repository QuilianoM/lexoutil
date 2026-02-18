export function erreurFR(
  err: unknown,
  fallback: string = "Une erreur est survenue. Réessayez."
): string {
  try {
    const msg =
      typeof err === "string"
        ? err
        : typeof (err as any)?.message === "string"
          ? (err as any).message
          : typeof (err as any)?.error === "string"
            ? (err as any).error
            : "";

    const m = (msg || "").toLowerCase();
    if (!m) return fallback;

    if (m.includes("fetch") || m.includes("network") || m.includes("failed to fetch")) {
      return "Problème de connexion internet. Réessayez.";
    }

    if (m.includes("jwt") || m.includes("token") || m.includes("auth") || m.includes("not authenticated")) {
      return "Votre session a expiré. Veuillez vous reconnecter.";
    }

    if (m.includes("permission") || m.includes("not allowed") || m.includes("forbidden") || m.includes("rls")) {
      return "Action non autorisée.";
    }

    if (m.includes("too many") || m.includes("rate limit") || m.includes("429")) {
      return "Trop de tentatives. Attendez un peu puis réessayez.";
    }

    if (m.includes("duplicate") || m.includes("already exists") || m.includes("unique")) {
      return "Cet élément existe déjà.";
    }

    if (m.includes("invalid") || m.includes("validation") || m.includes("bad request") || m.includes("400")) {
      return "Donnée invalide. Vérifiez les champs puis réessayez.";
    }

    return fallback;
  } catch {
    return fallback;
  }
}
