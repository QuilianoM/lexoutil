export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>

      <div className="mt-8 space-y-6 rounded-2xl border bg-white p-6 text-sm text-neutral-700">
        <p>
          <strong>Éditeur du site :</strong> Lexoutil (à compléter)
          <br />
          <strong>Adresse :</strong> (à compléter)
          <br />
          <strong>Email :</strong> (à compléter)
        </p>

        <p>
          <strong>Hébergeur :</strong> Vercel Inc. (à compléter si besoin)
        </p>

        <p className="text-neutral-600">
          Lexoutil propose des informations générales, des modèles et une assistance documentaire.
          Le contenu ne constitue pas un conseil juridique personnalisé.
        </p>
      </div>
    </main>
  );
}
