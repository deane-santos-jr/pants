import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export const supabaseConfigured = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const supabase = (): SupabaseClient | null => {
  if (client !== undefined) return client;
  client = supabaseConfigured()
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
    : null;
  return client;
};

export const ensureDeviceSession = async (db: SupabaseClient): Promise<string> => {
  const { data } = await db.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: anonymous, error } = await db.auth.signInAnonymously();
  if (error || !anonymous.user) throw error ?? new Error("Anonymous sign-in returned no user");
  return anonymous.user.id;
};
