import * as Sentry from "@sentry/nextjs";

export async function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    environment:
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV ||
      "development",

    tracesSampleRate: 0.1,
  });
}
