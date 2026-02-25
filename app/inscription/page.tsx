import { Suspense } from "react";
import InscriptionClient from "./InscriptionClient";

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Chargement…</div>}>
      <InscriptionClient />
    </Suspense>
  );
}
