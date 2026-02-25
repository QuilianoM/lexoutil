// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProd =
  (process.env.VERCEL_ENV && process.env.VERCEL_ENV === "production") ||
  process.env.NODE_ENV === "production";

Sentry.init({
  // ✅ Ne pas hardcoder le DSN
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ✅ Marquer dev / preview / prod automatiquement (Vercel)
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",

  // ✅ Optionnel : afficher le nom du release (utile avec Vercel)
  // release: process.env.VERCEL_GIT_COMMIT_SHA,

  // ✅ Integrations (Replay)
  integrations: [
    Sentry.replayIntegration({
      // Optionnel : masque les inputs (recommandé)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // ✅ Perf: on évite 100% en prod
  tracesSampleRate: isProd ? 0.1 : 1.0,

  // ✅ Logs: ok en dev, réduit en prod (ou false si tu veux)
  enableLogs: !isProd,

  // ✅ Replay: beaucoup en dev, léger en prod
  replaysSessionSampleRate: isProd ? 0.05 : 0.3,
  replaysOnErrorSampleRate: 1.0,

  // ✅ PII: recommandé OFF pour un site juridique (tu peux réactiver plus tard)
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
