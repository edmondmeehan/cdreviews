import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SiteSettings } from "./site-settings";

/**
 * Public, session-free read of the maintenance switch. The root route loads it
 * on the server so the very first HTML a reader gets is already the splash —
 * otherwise the site renders before the browser learns maintenance is on.
 */
export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async (): Promise<SiteSettings> => {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Site settings are unavailable");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from("site_settings").select("maintenance_mode, maintenance_message").eq("id", 1).maybeSingle();
  if (error) throw new Error("Unable to load site settings");
  return { maintenanceMode: !!data?.maintenance_mode, maintenanceMessage: data?.maintenance_message ?? null };
});
