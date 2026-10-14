import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FeaturedSlot = {
  id: string;
  review_slug: string;
  headline: string | null;
  blurb: string | null;
  starts_at: string;
  created_at: string;
};

export const featuredQueryKey = ["featured_slots"] as const;

export function useFeaturedSlots() {
  return useQuery({
    queryKey: featuredQueryKey,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_slots")
        .select("*")
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FeaturedSlot[];
    },
  });
}

/** The slot live right now: latest start time not in the future, whose review is published. */
export function currentSlot(
  slots: FeaturedSlot[],
  publishedSlugs: Set<string>,
  now: Date = new Date(),
): FeaturedSlot | undefined {
  return slots
    .filter((s) => new Date(s.starts_at) <= now && publishedSlugs.has(s.review_slug))
    .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))[0];
}
