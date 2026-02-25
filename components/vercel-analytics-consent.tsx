"use client";

import { useEffect, useState } from "react";
import { getConsent } from "@/lib/cookie-consent";

// IMPORTANT : nécessite le package "@vercel/analytics"
import { Analytics } from "@vercel/analytics/react";

export default function VercelAnalyticsConsent() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const c = getConsent();
    setEnabled(Boolean(c?.analytics));

    function onStorage() {
      const next = getConsent();
      setEnabled(Boolean(next?.analytics));
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}
