import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/** Records one view per public page navigation (admin/auth paths are ignored by the database). */
export function usePageViewTracker() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  useEffect(() => {
    supabase.rpc("record_page_view", { _path: pathname }).then(() => {}, () => {});
  }, [pathname]);
}

export function useMostReadReviews(days = 7, limit = 5) {
  return useQuery({
    queryKey: ["most-read", days, limit],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("most_read_reviews", { _days: days, _limit: limit });
      if (error) throw error;
      return (data ?? []) as { slug: string; views: number }[];
    },
  });
}
