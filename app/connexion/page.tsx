import { Suspense } from "react";
import ConnexionClient from "./ConnexionClient";

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement…</div>}>
      <ConnexionClient />
    </Suspense>
  );
}
