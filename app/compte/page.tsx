import "server-only";
import CompteClient from "./CompteClient";
import { requireUser } from "@/lib/auth/require-user";

export default async function Page() {
  await requireUser("/compte");
  return <CompteClient />;
}
