import { Suspense } from "react";
import PaiementSuccessClient from "./PaiementSuccessClient";

export default function PaiementSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-2xl font-semibold">Paiement confirmé</h1>
          <div className="mt-6 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Chargement de la confirmation…
            </p>
          </div>
        </main>
      }
    >
      <PaiementSuccessClient />
    </Suspense>
  );
}
