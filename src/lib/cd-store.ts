// Tiny client-side store for the cdreviews mock backend.
// Persists to localStorage so admin edits survive reloads.
// Real Cloud-backed data layer lands in a follow-up.

import { useSyncExternalStore, useMemo } from "react";
import {
  SEED_REVIEWS, SEED_FEATURES, SEED_LISTS, SEED_CONTRIBUTORS, SEED_SUBSCRIBERS,
  type Review, type Feature, type CdList, type Contributor, type Subscriber,
} from "./cd-data";

type Snapshot = {
  reviews: Review[];
  features: Feature[];
  lists: CdList[];
  contributors: Contributor[];
  subscribers: Subscriber[];
};

const KEY = "cdreviews:store:v1";
const isBrowser = typeof window !== "undefined";

function seed(): Snapshot {
  return {
    reviews: SEED_REVIEWS,
    features: SEED_FEATURES,
    lists: SEED_LISTS,
    contributors: SEED_CONTRIBUTORS,
    subscribers: SEED_SUBSCRIBERS,
  };
}

function load(): Snapshot {
  if (!isBrowser) return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Snapshot;
  } catch {
    return seed();
  }
}

const SERVER_SNAPSHOT: Snapshot = seed();
let snapshot: Snapshot = load();
const listeners = new Set<() => void>();

function emit() {
  if (isBrowser) {
    try { localStorage.setItem(KEY, JSON.stringify(snapshot)); } catch {}
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => SERVER_SNAPSHOT;

export function useCdStore<T>(selector: (s: Snapshot) => T): T {
  // Subscribe to the stable snapshot reference, derive via useMemo so
  // selectors returning new arrays/objects don't trip the
  // "getSnapshot should be cached" warning + infinite-render loop.
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => selector(snap), [snap, selector]);
}

// ─── mutations ──────────────────────────────────────────────────

export const cdActions = {
  resetAll() {
    snapshot = seed();
    emit();
  },

  // Reviews
  upsertReview(review: Review) {
    const i = snapshot.reviews.findIndex((r) => r.id === review.id);
    snapshot = {
      ...snapshot,
      reviews: i === -1 ? [review, ...snapshot.reviews] : snapshot.reviews.map((r) => r.id === review.id ? review : r),
    };
    emit();
  },
  deleteReview(id: string) {
    snapshot = { ...snapshot, reviews: snapshot.reviews.filter((r) => r.id !== id) };
    emit();
  },

  // Features
  upsertFeature(feat: Feature) {
    const i = snapshot.features.findIndex((f) => f.id === feat.id);
    snapshot = {
      ...snapshot,
      features: i === -1 ? [feat, ...snapshot.features] : snapshot.features.map((f) => f.id === feat.id ? feat : f),
    };
    emit();
  },
  deleteFeature(id: string) {
    snapshot = { ...snapshot, features: snapshot.features.filter((f) => f.id !== id) };
    emit();
  },

  // Lists
  upsertList(list: CdList) {
    const i = snapshot.lists.findIndex((l) => l.id === list.id);
    snapshot = {
      ...snapshot,
      lists: i === -1 ? [list, ...snapshot.lists] : snapshot.lists.map((l) => l.id === list.id ? list : l),
    };
    emit();
  },
  deleteList(id: string) {
    snapshot = { ...snapshot, lists: snapshot.lists.filter((l) => l.id !== id) };
    emit();
  },

  // Contributors
  upsertContributor(c: Contributor) {
    const i = snapshot.contributors.findIndex((x) => x.id === c.id);
    snapshot = {
      ...snapshot,
      contributors: i === -1 ? [...snapshot.contributors, c] : snapshot.contributors.map((x) => x.id === c.id ? c : x),
    };
    emit();
  },
  deleteContributor(id: string) {
    snapshot = { ...snapshot, contributors: snapshot.contributors.filter((c) => c.id !== id) };
    emit();
  },

  // Subscribers
  addSubscriber(email: string) {
    if (snapshot.subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) return;
    const sub: Subscriber = {
      id: crypto.randomUUID(),
      email,
      signedUp: new Date().toISOString(),
    };
    snapshot = { ...snapshot, subscribers: [sub, ...snapshot.subscribers] };
    emit();
  },
  deleteSubscriber(id: string) {
    snapshot = { ...snapshot, subscribers: snapshot.subscribers.filter((s) => s.id !== id) };
    emit();
  },
};
