export type CookieConsent = {
  version: 1;
  updatedAt: number;
  analytics: boolean; // Vercel Analytics
};

const KEY = "lexoutil:cookie-consent:v1";

export function getConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (!parsed || parsed.version !== 1) return null;
    if (typeof parsed.analytics !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(consent: Omit<CookieConsent, "version" | "updatedAt">) {
  if (typeof window === "undefined") return;
  const payload: CookieConsent = {
    version: 1,
    updatedAt: Date.now(),
    analytics: !!consent.analytics,
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function clearConsent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
