import dynamic from "next/dynamic";

/*
  On charge la page connexion uniquement côté client
  → évite tous les bugs de prerender / useSearchParams / auth
*/

const ConnexionClient = dynamic(
  () => import("./ConnexionClient"),
  { ssr: false }
);

export default function ConnexionPage() {
  return <ConnexionClient />;
}
