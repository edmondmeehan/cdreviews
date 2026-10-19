// Pure, browser-safe ad selection helpers (shared with tests).
export type AdPlacement = "home_break" | "review_inline" | "review_side" | "list_card" | "footer_strip";

export const AD_PLACEMENTS: Array<{ key: AdPlacement; label: string; hint: string }> = [
  { key: "home_break", label: "Homepage break", hint: "Wide band between homepage sections. Image ~1600×800 (2:1)." },
  { key: "review_inline", label: "Inside review text", hint: "Appears after the third paragraph. Image ~1200×630." },
  { key: "review_side", label: "Review sidebar (desktop)", hint: "Beside the review on wide screens. Image ~600×600." },
  { key: "list_card", label: "Archive / search lists", hint: "A sponsored row within the list. Small square image." },
  { key: "footer_strip", label: "Footer strip", hint: "One-line sponsor above the footer, every page." },
];

export type AdLike = {
  id: string; placement: string; active: boolean; weight: number;
  starts_at: string | null; ends_at: string | null;
};

export function isRunning(ad: AdLike, now: Date = new Date()) {
  if (!ad.active) return false;
  if (ad.starts_at && new Date(ad.starts_at) > now) return false;
  if (ad.ends_at && new Date(ad.ends_at) <= now) return false;
  return true;
}

/** Weighted random pick among running ads for a placement. `rand` in [0,1). */
export function pickAd<T extends AdLike>(ads: T[], placement: AdPlacement, rand: number, now: Date = new Date()): T | null {
  const pool = ads.filter((a) => a.placement === placement && isRunning(a, now));
  if (!pool.length) return null;
  const total = pool.reduce((s, a) => s + Math.max(1, a.weight), 0);
  let x = rand * total;
  for (const a of pool) {
    x -= Math.max(1, a.weight);
    if (x < 0) return a;
  }
  return pool[pool.length - 1];
}

export function clickRate(views: number, clicks: number) {
  return views > 0 ? `${((clicks / views) * 100).toFixed(1)}%` : "—";
}
