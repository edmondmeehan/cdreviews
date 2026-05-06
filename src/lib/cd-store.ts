// Lovable Cloud-backed data layer. Preserves the (synchronous-feeling)
// useCdStore + cdActions API the UI was already using, so route components
// keep working while we swap the source of truth from localStorage to Postgres.
//
// Reads: react-query against Supabase (browser client + RLS). The selector-style
//        useCdStore(selector) hook resolves the same Snapshot shape the UI expects.
// Writes: cdActions.* fire Supabase mutations and invalidate the cache.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  type Review, type Feature, type CdList, type Contributor, type Subscriber,
} from "./cd-data";

type Snapshot = {
  reviews: Review[];
  features: Feature[];
  lists: CdList[];
  contributors: Contributor[];
  subscribers: Subscriber[];
  ready: boolean;
};

const EMPTY: Snapshot = {
  reviews: [], features: [], lists: [], contributors: [], subscribers: [], ready: false,
};

// ─── Row → app shape mappers ──────────────────────────────────────

type Decade = Review["decade"];
type Kind = Review["kind"];

function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    artist: String(row.artist),
    label: String(row.label ?? "—"),
    format: String(row.format ?? ""),
    genre: String(row.genre ?? ""),
    date: String(row.date),
    decade: String(row.decade) as Decade,
    kind: String(row.kind) as Kind,
    score: Number(row.score ?? 0),
    art: String(row.art ?? "art-1"),
    byline: String(row.byline ?? "Staff"),
    readMins: Number(row.read_mins ?? 2),
    body: Array.isArray(row.body) ? (row.body as string[]) : [],
    status: row.status === "published" ? "published" : "draft",
    pull: (row.pull as string | undefined) ?? undefined,
    labelAddress: (row.label_address as string | undefined) ?? undefined,
    contact: (row.contact as string | undefined) ?? undefined,
    archiveUrl: (row.archive_url as string | undefined) ?? undefined,
    period: (row.period as string | undefined) ?? undefined,
    artUrl: (row.art_url as string | undefined) ?? undefined,
    spotifyUrl: (row.spotify_url as string | undefined) ?? undefined,
    spotifyAlbumId: (row.spotify_album_id as string | undefined) ?? undefined,
  };
}

function reviewToRow(r: Review): Record<string, unknown> {
  return {
    id: isUuid(r.id) ? r.id : undefined, // let DB assign for slug-style ids
    slug: r.slug,
    title: r.title,
    artist: r.artist,
    label: r.label || "—",
    format: r.format || "CD",
    genre: r.genre || "Uncategorized",
    date: r.date,
    decade: r.decade,
    kind: r.kind,
    score: r.score,
    art: r.art,
    byline: r.byline || "Staff",
    read_mins: r.readMins,
    body: r.body,
    status: r.status,
    label_address: r.labelAddress ?? null,
    contact: r.contact ?? null,
    archive_url: r.archiveUrl ?? null,
    period: r.period ?? null,
    art_url: r.artUrl ?? null,
    spotify_url: r.spotifyUrl ?? null,
    spotify_album_id: r.spotifyAlbumId ?? null,
  };
}

function rowToFeature(row: Record<string, unknown>): Feature {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    dek: String(row.dek ?? ""),
    byline: String(row.byline ?? "Staff"),
    date: row.published_at ? new Date(row.published_at as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).replace(/\//g, ".") : "",
    readMins: 6,
    art: String(row.hero ?? "art-hero"),
    body: Array.isArray(row.body) ? (row.body as string[]) : [],
    status: row.status === "published" ? "published" : "draft",
  };
}
function featureToRow(f: Feature): Record<string, unknown> {
  return {
    id: isUuid(f.id) ? f.id : undefined,
    slug: f.slug, title: f.title, dek: f.dek, byline: f.byline,
    body: f.body, hero: f.art, status: f.status,
    published_at: f.status === "published" ? new Date().toISOString() : null,
  };
}

function rowToList(row: Record<string, unknown>): CdList {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    dek: String(row.dek ?? ""),
    byline: "Editorial",
    date: row.published_at ? new Date(row.published_at as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).replace(/\//g, ".") : "",
    art: "art-1",
    items: Array.isArray(row.items) ? (row.items as CdList["items"]) : [],
    status: row.status === "published" ? "published" : "draft",
  };
}
function listToRow(l: CdList): Record<string, unknown> {
  return {
    id: isUuid(l.id) ? l.id : undefined,
    slug: l.slug, title: l.title, dek: l.dek,
    items: l.items, status: l.status,
    published_at: l.status === "published" ? new Date().toISOString() : null,
  };
}

function rowToContributor(row: Record<string, unknown>): Contributor {
  return {
    id: String(row.id),
    name: String(row.name),
    role: String(row.role) as Contributor["role"],
    bio: String(row.bio ?? ""),
    city: String(row.city ?? ""),
  };
}
function contributorToRow(c: Contributor): Record<string, unknown> {
  return {
    id: isUuid(c.id) ? c.id : undefined,
    name: c.name, role: c.role, bio: c.bio, city: c.city,
  };
}

function rowToSubscriber(row: Record<string, unknown>): Subscriber {
  return {
    id: String(row.id),
    email: String(row.email),
    signedUp: String(row.signed_up),
  };
}

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

// ─── Hook ─────────────────────────────────────────────────────────

const KEY = ["cdreviews", "snapshot"] as const;

async function fetchSnapshot(): Promise<Snapshot> {
  const [reviews, features, lists, contributors, subscribers] = await Promise.all([
    supabase.from("reviews").select("*").order("date", { ascending: false }),
    supabase.from("features").select("*").order("created_at", { ascending: false }),
    supabase.from("lists").select("*").order("created_at", { ascending: false }),
    supabase.from("contributors").select("*").order("created_at", { ascending: true }),
    // RLS: only admins see subscribers; non-admins get empty array silently
    supabase.from("subscribers").select("*").order("signed_up", { ascending: false }),
  ]);
  return {
    reviews: (reviews.data ?? []).map(rowToReview),
    features: (features.data ?? []).map(rowToFeature),
    lists: (lists.data ?? []).map(rowToList),
    contributors: (contributors.data ?? []).map(rowToContributor),
    subscribers: (subscribers.data ?? []).map(rowToSubscriber),
    ready: true,
  };
}

export function useCdStore<T>(selector: (s: Snapshot) => T): T {
  const { data } = useQuery({
    queryKey: KEY,
    queryFn: fetchSnapshot,
    staleTime: 30_000,
  });
  const snap = data ?? EMPTY;
  return useMemo(() => selector(snap), [snap, selector]);
}

// Imperative invalidator for actions to use.
let _invalidate: () => void = () => {};
export function useCdInvalidator() {
  const qc = useQueryClient();
  _invalidate = () => qc.invalidateQueries({ queryKey: KEY });
}
function invalidate() { _invalidate(); }

// ─── Mutations ────────────────────────────────────────────────────

export const cdActions = {
  resetAll() {
    // No longer destructive; just refetch from server.
    invalidate();
  },

  // Reviews
  async upsertReview(review: Review) {
    const row = reviewToRow(review);
    const { error } = await supabase.from("reviews").upsert(row as never, { onConflict: "slug" });
    if (error) console.error("upsertReview", error);
    invalidate();
  },
  async deleteReview(id: string) {
    const col = isUuid(id) ? "id" : "slug";
    const { error } = await supabase.from("reviews").delete().eq(col, id);
    if (error) console.error("deleteReview", error);
    invalidate();
  },
  async bulkUpsertReviews(rows: Review[]) {
    if (rows.length === 0) return;
    const { error } = await supabase.from("reviews").upsert(rows.map(reviewToRow) as never, { onConflict: "slug" });
    if (error) console.error("bulkUpsertReviews", error);
    invalidate();
  },

  // Features
  async upsertFeature(feat: Feature) {
    const { error } = await supabase.from("features").upsert(featureToRow(feat) as never, { onConflict: "slug" });
    if (error) console.error("upsertFeature", error);
    invalidate();
  },
  async deleteFeature(id: string) {
    const col = isUuid(id) ? "id" : "slug";
    const { error } = await supabase.from("features").delete().eq(col, id);
    if (error) console.error("deleteFeature", error);
    invalidate();
  },

  // Lists
  async upsertList(list: CdList) {
    const { error } = await supabase.from("lists").upsert(listToRow(list) as never, { onConflict: "slug" });
    if (error) console.error("upsertList", error);
    invalidate();
  },
  async deleteList(id: string) {
    const col = isUuid(id) ? "id" : "slug";
    const { error } = await supabase.from("lists").delete().eq(col, id);
    if (error) console.error("deleteList", error);
    invalidate();
  },

  // Contributors
  async upsertContributor(c: Contributor) {
    const { error } = await supabase.from("contributors").upsert(contributorToRow(c) as never);
    if (error) console.error("upsertContributor", error);
    invalidate();
  },
  async deleteContributor(id: string) {
    if (!isUuid(id)) { console.warn("deleteContributor needs uuid"); return; }
    const { error } = await supabase.from("contributors").delete().eq("id", id);
    if (error) console.error("deleteContributor", error);
    invalidate();
  },

  // Subscribers
  async addSubscriber(email: string) {
    const { error } = await supabase.from("subscribers").insert({ email } as never);
    if (error && !error.message.toLowerCase().includes("duplicate")) console.error("addSubscriber", error);
    invalidate();
  },
  async deleteSubscriber(id: string) {
    const { error } = await supabase.from("subscribers").delete().eq("id", id);
    if (error) console.error("deleteSubscriber", error);
    invalidate();
  },
};
