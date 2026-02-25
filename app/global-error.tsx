"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log utile en dev (sans casser l'UI)
    console.error("GLOBAL ERROR:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            maxWidth: 720,
            margin: "40px auto",
            padding: 20,
            border: "1px solid #e4e4e7",
            borderRadius: 12,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20 }}>Une erreur est survenue</h1>
          <p style={{ color: "#52525b", marginTop: 8 }}>
            L’application a rencontré un problème. Vous pouvez recharger la page
            ou réessayer.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              onClick={() => reset()}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #18181b",
                background: "#18181b",
                color: "white",
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e4e4e7",
                background: "white",
                cursor: "pointer",
              }}
            >
              Retour à l’accueil
            </button>
          </div>

          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: "pointer" }}>
              Détails techniques (dev)
            </summary>
            <pre style={{ whiteSpace: "pre-wrap", color: "#18181b" }}>
              {String(error?.message || error)}
            </pre>
          </details>
        </div>
      </body>
    </html>
  );
}
