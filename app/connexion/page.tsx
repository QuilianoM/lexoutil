import { Suspense } from "react";
import dynamic from "next/dynamic";

const ConnexionClient = dynamic(
  () => import("./ConnexionClient"),
  { ssr: false }
);

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement...</div>}>
      <ConnexionClient />
    </Suspense>
  );
}
