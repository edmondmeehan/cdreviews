import { test } from "node:test";
import assert from "node:assert/strict";
import { currentSlot, type FeaturedSlot } from "./featured";

const s = (id: string, slug: string, at: string): FeaturedSlot => ({ id, review_slug: slug, headline: null, blurb: null, starts_at: at, created_at: at });
const now = new Date("2026-10-14T12:00:00Z");
const pub = new Set(["a", "b", "c"]);

test("picks the most recent slot that has started", () => {
  assert.equal(currentSlot([s("1", "a", "2026-10-01T00:00:00Z"), s("2", "b", "2026-10-10T00:00:00Z")], pub, now)?.id, "2");
});
test("scheduled future slot is not live yet", () => {
  assert.equal(currentSlot([s("1", "a", "2026-10-01T00:00:00Z"), s("2", "b", "2026-10-20T00:00:00Z")], pub, now)?.id, "1");
});
test("skips unpublished reviews", () => {
  assert.equal(currentSlot([s("1", "a", "2026-10-01T00:00:00Z"), s("2", "zz", "2026-10-10T00:00:00Z")], pub, now)?.id, "1");
});
