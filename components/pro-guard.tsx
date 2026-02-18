"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSubscriptionStatus } from "@/lib/subscription";

type Props = {
  titre?: string;
  description?: string;
  children: React.ReactNode;
};

export default function ProGuard({
  titre = "Fonctionnalité Pro",
  description = "Cette fonctionnalité est réservée aux comptes Pro.",
  children,
}: Props) {
  const status = getSubscriptionStatus();

  // Si on ne sait pas encore (null), on laisse passer sans bloquer (UX simple)
  // La synchro Pro est faite automatiquement par ProStatusSync.
  if (status.pro === null) {
    return <>{children}</>;
  }

  if (status.pro === true) {
    return <>{children}</>;
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm font-semibold text-zinc-900">{titre}</div>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/tarifs">Passer en Pro</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/documents">Continuer en local</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
