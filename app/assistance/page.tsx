"use client";

import { useState } from "react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { sanitizeEmail, sanitizeText, isEmailOk } from "@/lib/sanitize";

type FormState = {
  nom: string;
  email: string;
  sujet: string;
  message: string;
};

const defaultState: FormState = {
  nom: "",
  email: "",
  sujet: "",
  message: "",
};

export default function AssistancePage() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [status, setStatus] = useState<"idle" | "ok" | "err" | "loading">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg("");

    // ✅ Nettoyage (Étape 8)
    const nom = sanitizeText(form.nom, { maxLen: 80 });
    const email = sanitizeEmail(form.email);
    const sujet = sanitizeText(form.sujet, { maxLen: 120 });
    const message = sanitizeText(form.message, { maxLen: 2000, multiline: true });

    if (!nom || !email || !sujet || !message) {
      setStatus("err");
      setErrorMsg("Merci de remplir tous les champs.");
      return;
    }

    if (!isEmailOk(email)) {
      setStatus("err");
      setErrorMsg("Merci de saisir une adresse e-mail valide.");
      return;
    }

    // MVP : pas d’envoi serveur pour le moment.
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 600));

    setStatus("ok");
    setForm(defaultState);
  }

  return (
    <Container size="md" className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Assistance</h1>

      <p className="mt-1 text-sm text-zinc-600">
        Expliquez votre situation et recevez une réponse sur les étapes possibles et les documents utiles.
      </p>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Important</h2>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>
                Lexoutil fournit une aide <strong>générale</strong> (explications et modèles), et non un conseil
                juridique personnalisé.
              </li>
              <li>
                Pour les situations urgentes / complexes, rapprochez-vous d’un <strong>avocat</strong> ou d’un
                professionnel du droit.
              </li>
              <li>
                N’envoyez pas de données sensibles (numéros de carte, mots de passe, documents d’identité complets, etc.).
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">Informations générales</Badge>
              <Badge variant="outline">Modèles de documents</Badge>
              <Badge variant="outline">Orientation</Badge>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Formulaire de contact</h2>
                <p className="text-xs text-zinc-500">Réponse sous 24–72h (MVP — ajustable).</p>
              </div>

              {/* ✅ Badge compatible (seulement default/outline) */}
              {status === "ok" ? (
                <Badge className="bg-green-600 text-white hover:bg-green-600">Message enregistré</Badge>
              ) : status === "err" ? (
                <Badge className="bg-red-600 text-white hover:bg-red-600">Erreur</Badge>
              ) : null}
            </div>

            {/* ✅ Erreur visible (au lieu d’alert) */}
            {errorMsg ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMsg}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-zinc-700">Votre nom</span>
                <Input
                  className="mt-1"
                  value={form.nom}
                  placeholder="Ex. Jean Dupont"
                  autoComplete="name"
                  onChange={(e) => setForm((s) => ({ ...s, nom: e.target.value }))}
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-700">Votre e-mail</span>
                <Input
                  className="mt-1"
                  value={form.email}
                  placeholder="exemple@mail.com"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-medium text-zinc-700">Sujet</span>
                <Input
                  className="mt-1"
                  value={form.sujet}
                  placeholder="Ex. Litige livraison, mise en demeure, contestation facture…"
                  onChange={(e) => setForm((s) => ({ ...s, sujet: e.target.value }))}
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-medium text-zinc-700">Message</span>
                <Textarea
                  className="mt-1 min-h-[140px]"
                  value={form.message}
                  placeholder="Décrivez la situation : dates, faits, échanges, et ce que vous souhaitez obtenir."
                  onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Conseil : indiquez les dates importantes et les preuves disponibles (facture, suivi, e-mails…).
                </p>
              </label>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row md:col-span-2">
                <Button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Envoi…" : "Envoyer"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setForm(defaultState);
                    setStatus("idle");
                    setErrorMsg("");
                  }}
                >
                  Réinitialiser
                </Button>

                <div className="flex-1" />

                <span className="self-center text-xs text-zinc-500">
                  En soumettant, vous acceptez que vos informations soient utilisées pour répondre à votre demande.
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </Section>
    </Container>
  );
}
