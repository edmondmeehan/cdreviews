import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = { maintenanceMode: boolean; maintenanceMessage: string | null };

const KEY = ["site-settings"];

/** Paths that stay reachable while the site is in maintenance. */
export function isMaintenanceExempt(pathname: string) {
  return ["/admin", "/auth", "/reset-password", "/preview"].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function useSiteSettings() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<SiteSettings> => {
      const { data } = await supabase.from("site_settings").select("maintenance_mode, maintenance_message").eq("id", 1).maybeSingle();
      return { maintenanceMode: !!data?.maintenance_mode, maintenanceMessage: data?.maintenance_message ?? null };
    },
    staleTime: 30_000,
  });
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return async (patch: { maintenance_mode?: boolean; maintenance_message?: string | null }) => {
    const { error } = await supabase.from("site_settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
    await qc.invalidateQueries({ queryKey: KEY });
    return error?.message;
  };
}
