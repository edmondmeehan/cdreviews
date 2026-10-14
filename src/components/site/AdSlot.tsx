import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { pickAd, type AdPlacement } from "@/lib/ad-pick";

type Ad = {
  id: string; placement: string; active: boolean; weight: number; starts_at: string | null; ends_at: string | null;
  advertiser: string; headline: string; body: string; cta: string; image_url: string | null; link_url: string;
};

function useRunningAds() {
  return useQuery({
    queryKey: ["ads", "running"],
    queryFn: async (): Promise<Ad[]> => {
      const { data } = await supabase.from("ads").select("id, placement, active, weight, starts_at, ends_at, advertiser, headline, body, cta, image_url, link_url");
      return (data ?? []) as Ad[];
    },
    staleTime: 60_000,
  });
}

const seen = new Set<string>();

/** A house-styled sponsored spot. Renders nothing when no ad is running. */
export function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const { data } = useRunningAds();
  const [rand, setRand] = useState<number | null>(null);
  useEffect(() => setRand(Math.random()), []);
  const ad = data && rand !== null ? pickAd(data, placement, rand) : null;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ad || !ref.current) return;
    const key = `${ad.id}:${placement}:${location.pathname}`;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !seen.has(key)) {
        seen.add(key);
        void supabase.rpc("record_ad_event", { _ad_id: ad.id, _kind: "view" });
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ad, placement]);

  if (!ad) return null;
  const click = () => { void supabase.rpc("record_ad_event", { _ad_id: ad.id, _kind: "click" }); };
  const linkProps = { href: ad.link_url, target: "_blank", rel: "sponsored noopener", onClick: click } as const;
  const label = (
    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">
      Sponsored{ad.advertiser ? ` · ${ad.advertiser}` : ""}
    </div>
  );

  if (placement === "footer_strip") {
    return (
      <aside ref={ref} className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 ${className}`} aria-label="Sponsored">
        <a {...linkProps} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-rule py-3 group">
          {label}
          <span className="fr-blurb text-[15px] text-ink">{ad.headline}</span>
          <span className="ml-auto font-mono text-[11px] tracking-[0.12em] uppercase text-vermil group-hover:underline">{ad.cta} ↗</span>
        </a>
      </aside>
    );
  }

  if (placement === "list_card") {
    return (
      <aside ref={ref} className={`border-b border-rule ${className}`} aria-label="Sponsored">
        <a {...linkProps} className="flex items-center gap-4 py-4 group">
          {ad.image_url && <img src={ad.image_url} alt="" loading="lazy" className="w-14 h-14 object-cover shrink-0" />}
          <div className="min-w-0 flex-1">
            {label}
            <div className="fr-display text-[20px] text-ink truncate">{ad.headline}</div>
          </div>
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil group-hover:underline shrink-0">{ad.cta} ↗</span>
        </a>
      </aside>
    );
  }

  if (placement === "home_break") {
    return (
      <aside ref={ref} className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 ${className}`} aria-label="Sponsored">
        <a {...linkProps} className="grid md:grid-cols-12 gap-0 border border-rule bg-bone-warm group overflow-hidden">
          {ad.image_url && (
            <div className="md:col-span-7 aspect-[16/7] md:aspect-auto overflow-hidden">
              <img src={ad.image_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
            </div>
          )}
          <div className={`${ad.image_url ? "md:col-span-5" : "md:col-span-12"} p-8 md:p-10 flex flex-col justify-center gap-4`}>
            {label}
            <h3 className="fr-display text-[clamp(30px,3vw,44px)] text-ink leading-[1.05]">{ad.headline}</h3>
            {ad.body && <p className="fr-blurb text-[16px] text-ink-2">{ad.body}</p>}
            <span className="font-mono text-[12px] tracking-[0.12em] uppercase text-vermil group-hover:underline">{ad.cta} ↗</span>
          </div>
        </a>
      </aside>
    );
  }

  // review_inline / review_side
  return (
    <aside ref={ref} className={className} aria-label="Sponsored">
      <a {...linkProps} className="block border-y border-rule py-6 space-y-3 group not-prose">
        {label}
        {ad.image_url && <img src={ad.image_url} alt="" loading="lazy" className="w-full object-cover" />}
        <div className="fr-display text-[24px] text-ink leading-tight">{ad.headline}</div>
        {ad.body && <p className="fr-blurb text-[15px] text-ink-2">{ad.body}</p>}
        <span className="inline-block font-mono text-[11px] tracking-[0.12em] uppercase text-vermil group-hover:underline">{ad.cta} ↗</span>
      </a>
    </aside>
  );
}
