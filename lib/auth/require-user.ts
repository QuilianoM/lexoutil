import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function requireUser(redirectTo?: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const target = redirectTo ?? "/";
    redirect(`/connexion?redirect=${encodeURIComponent(target)}`);
  }

  return data.user;
}
