"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || data?.ok !== true || typeof data?.url !== "string") {
        alert(
          typeof data?.error === "string"
            ? data.error
            : "Impossible d’ouvrir le portail."
        );
        return;
      }

      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" onClick={openPortal} disabled={loading}>
      {loading ? "Ouverture…" : "Gérer mon abonnement"}
    </Button>
  );
}
