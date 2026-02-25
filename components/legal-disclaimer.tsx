import Link from "next/link";

type Variant = "global" | "sensible" | "contact";

export default function LegalDisclaimer({
  variant = "global",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const content =
    variant === "sensible"
      ? {
          title: "Cadre d’utilisation (important)",
          lines: [
            "Lexoutil fournit des informations générales et des modèles de documents.",
            "Cela ne constitue pas un conseil juridique personnalisé, ni une consultation d’avocat.",
            "Vérifiez, adaptez et relisez avant envoi. En cas d’urgence ou de dossier complexe : avocat / professionnel du droit.",
            "Ne transmettez jamais d’informations sensibles (mots de passe, données bancaires, etc.).",
          ],
          cta: { href: "/confidentialite", label: "Voir Confidentialité" },
        }
      : variant === "contact"
        ? {
            title: "Avant d’envoyer votre message",
            lines: [
              "Décrivez les faits de manière simple et chronologique (dates, preuves, échanges).",
              "Évitez les données sensibles (mots de passe, carte bancaire, etc.).",
              "La réponse fournie reste une orientation générale et non un conseil personnalisé.",
            ],
            cta: { href: "/cgu", label: "Voir CGU" },
          }
        : {
            title: "Avertissement",
            lines: [
              "Lexoutil fournit des informations générales et des modèles.",
              "Ce service ne remplace pas un professionnel du droit.",
            ],
            cta: { href: "/cgu", label: "Lire les CGU" },
          };

  return (
    <div
      className={[
        "rounded-xl border border-zinc-200 bg-white p-4",
        className,
      ].join(" ")}
      role="note"
      aria-label="Avertissement légal"
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white"
          aria-hidden="true"
        >
          !
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900">{content.title}</div>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {content.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>

          <div className="mt-3 text-xs text-zinc-500">
            En utilisant Lexoutil, vous acceptez les pages légales :{" "}
            <Link className="underline" href="/mentions">
              Mentions légales
            </Link>
            ,{" "}
            <Link className="underline" href="/confidentialite">
              Confidentialité
            </Link>{" "}
            et{" "}
            <Link className="underline" href="/cgu">
              CGU
            </Link>
            .
          </div>

          <div className="mt-2">
            <Link className="text-xs underline text-zinc-700 hover:text-zinc-900" href={content.cta.href}>
              {content.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
