export default function ConfidentialitePage() {
  return (
    <main className="mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Confidentialité</h1>

      <div className="mt-8 space-y-4 rounded-2xl border bg-white p-6 text-sm text-neutral-700">
        <p>
          Cette page décrit comment les données sont collectées et utilisées (à compléter).
        </p>
        <ul className="list-disc space-y-2 pl-5 text-neutral-600">
          <li>Données fournies via formulaires (ex : génération de document)</li>
          <li>Données techniques (logs, sécurité)</li>
          <li>Durées de conservation</li>
          <li>Droits RGPD : accès, rectification, suppression</li>
        </ul>
      </div>
    </main>
  );
}
