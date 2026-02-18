import "server-only";
import HistoriqueClient from "./HistoriqueClient";
import { requireUser } from "@/lib/auth/require-user";

export default async function Page() {
  await requireUser("/historique");
  return <HistoriqueClient />;
}
