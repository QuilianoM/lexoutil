"use client";

import { useId, useMemo, useState } from "react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import LegalDisclaimer from "@/components/legal-disclaimer";

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

function ErrorBox({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div
      className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      role="alert"
      aria-live="polite"
    >
      {text}
    </div>
  );
}

export default function AssistancePage() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [status, setStatus] = useState<"idle" | "ok" | "err" | "loading">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // IDs stables pour l’accessibilité
  const baseId = useId();
  const ids = useMemo(() => {
    return {
      nom: `${baseId}-nom`,
      email: `${baseId}-email`,
      sujet: `${baseId}-sujet`,
      message: `${baseId}-message`,
      messageHelp: `${baseId}-message-help`,
      formError: `${baseId}-form-error`,
    };
  }, [baseId]);

  const cleaned = useMemo(() => {
    return {
      nom: sanitizeText(form.nom, { maxLen: 80 }),
      email: sanitizeEmail(form.email),
      sujet: sanitizeText(form.sujet, { maxLen: 120 }),
      message: sanitizeText(form.message, { maxLen: 2000, multiline: true }),
    };
  }, [form]);

  const fieldErrors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!cleaned.nom) e.nom = "Merci de renseigner votre nom.";
    if (!cleaned.email) e.email = "Merci de renseigner votre e-mail.";
    else if (!isEmailOk(cleaned.email)) e.email = "Merci de saisir une adresse e-mail valide.";
    if (!cleaned.sujet) e.sujet = "Merci de renseigner un sujet.";
    if (!cleaned.message) e.message = "Merci de décrire votre situation.";
    return e;
  }, [cleaned]);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg("");

    if (hasErrors) {
      setStatus("err");
      setErrorMsg("Certaines informations sont manquantes ou invalides. Merci de vérifier les champs.");
      return;
    }

    setStatus("loading");

    // MVP : simulation
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

      <div className="mt-6">
        <LegalDisclaimer variant="contact" />
      </div>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <div className="mt-1 flex flex-wrap gap-2">
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

              {status === "ok" ? (
                <Badge className="bg-green-600 text-white hover:bg-green-600">Message enregistré</Badge>
              ) : status === "err" ? (
                <Badge className="bg-red-600 text-white hover:bg-red-600">Erreur</Badge>
              ) : null}
            </div>

            {/* Erreur globale accessible */}
            <ErrorBox text={errorMsg} />

            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" noValidate>
              <div className="block">
                <label htmlFor={ids.nom} className="text-xs font-medium text-zinc-700">
                  Votre nom
                </label>
                <Input
                  id={ids.nom}
                  className="mt-1"
                  value={form.nom}
                  placeholder="Ex. Jean Dupont"
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.nom)}
                  aria-describedby={fieldErrors.nom ? ids.formError : undefined}
                  onChange={(e) => setForm((s) => ({ ...s, nom: e.target.value }))}
                />
                {fieldErrors.nom ? (
                  <p className="mt-1 text-xs text-red-600" role="alert" aria-live="polite">
                    {fieldErrors.nom}
                  </p>
                ) : null}
              </div>

              <div className="block">
                <label htmlFor={ids.email} className="text-xs font-medium text-zinc-700">
                  Votre e-mail
                </label>
                <Input
                  id={ids.email}
                  className="mt-1"
                  value={form.email}
                  placeholder="exemple@mail.com"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? ids.formError : undefined}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
                {fieldErrors.email ? (
                  <p className="mt-1 text-xs text-red-600" role="alert" aria-live="polite">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="block md:col-span-2">
                <label htmlFor={ids.sujet} className="text-xs font-medium text-zinc-700">
                  Sujet
                </label>
                <Input
                  id={ids.sujet}
                  className="mt-1"
                  value={form.sujet}
                  placeholder="Ex. Litige livraison, mise en demeure, contestation facture…"
                  aria-invalid={Boolean(fieldErrors.sujet)}
                  aria-describedby={fieldErrors.sujet ? ids.formError : undefined}
                  onChange={(e) => setForm((s) => ({ ...s, sujet: e.target.value }))}
                />
                {fieldErrors.sujet ? (
                  <p className="mt-1 text-xs text-red-600" role="alert" aria-live="polite">
                    {fieldErrors.sujet}
                  </p>
                ) : null}
              </div>

              <div className="block md:col-span-2">
                <label htmlFor={ids.message} className="text-xs font-medium text-zinc-700">
                  Message
                </label>
                <Textarea
                  id={ids.message}
                  className="mt-1 min-h-36"
                  value={form.message}
                  placeholder="Décrivez la situation : dates, faits, échanges, et ce que vous souhaitez obtenir."
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={`${ids.messageHelp}${fieldErrors.message ? ` ${ids.formError}` : ""}`}
                  onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                />
                <p id={ids.messageHelp} className="mt-2 text-xs text-zinc-500">
                  Conseil : indiquez les dates importantes et les preuves disponibles (facture, suivi, e-mails…).
                </p>
                {fieldErrors.message ? (
                  <p className="mt-1 text-xs text-red-600" role="alert" aria-live="polite">
                    {fieldErrors.message}
                  </p>
                ) : null}
              </div>

              {/* Zone d’erreur globale référencée par aria-describedby */}
              <div id={ids.formError} className="sr-only" aria-live="polite">
                {status === "err" ? "Erreur : certains champs sont invalides." : ""}
              </div>

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
