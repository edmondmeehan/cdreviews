import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REVIEWS_PAGE_SIZE, filterReviews, paginate, pageWindow } from "./review-admin-list";

const mk = (over: Record<string, unknown> = {}) => ({
  id: "x", slug: "s", title: "Unknown Pleasures", artist: "Joy Division", label: "Factory",
  genre: "Post-Punk", format: "LP", byline: "Staff", decade: "1990s", kind: "review",
  status: "published", score: 9, ...over,
}) as never;

describe("filterReviews", () => {
  it("matches on artist, title, label and genre", () => {
    const all = [mk(), mk({ artist: "Slowdive", title: "Souvlaki", label: "Creation", genre: "Shoegaze" })];
    assert.deepEqual(filterReviews(all, "slowdive").map((r) => r.artist), ["Slowdive"]);
    assert.deepEqual(filterReviews(all, "factory").map((r) => r.artist), ["Joy Division"]);
    assert.deepEqual(filterReviews(all, "shoegaze").map((r) => r.artist), ["Slowdive"]);
  });

  it("requires every term to appear, in any order", () => {
    const all = [mk(), mk({ artist: "Slowdive", title: "Souvlaki" })];
    assert.deepEqual(filterReviews(all, "joy division").map((r) => r.artist), ["Joy Division"]);
    assert.deepEqual(filterReviews(all, "division joy").map((r) => r.artist), ["Joy Division"]);
    assert.equal(filterReviews(all, "joy slowdive").length, 0);
  });

  it("matches status words like draft and scheduled", () => {
    const all = [mk(), mk({ status: "draft" }), mk({ status: "draft", publishAt: "2026-11-01T00:00:00Z" })];
    assert.equal(filterReviews(all, "draft").length, 2);
    assert.equal(filterReviews(all, "scheduled").length, 1);
    assert.equal(filterReviews(all, "published").length, 1);
  });

  it("returns the full list untouched for an empty or whitespace query", () => {
    const all = [mk(), mk({ artist: "Slowdive" })];
    assert.equal(filterReviews(all, "").length, 2);
    assert.equal(filterReviews(all, "   ").length, 2);
  });
});

describe("paginate", () => {
  const rows = Array.from({ length: 96 }, (_, i) => i);

  it("defaults to 25 reviews per page", () => {
    assert.equal(REVIEWS_PAGE_SIZE, 25);
    assert.equal(paginate(rows, 1).items.length, 25);
  });

  it("splits 96 reviews into 4 pages with a short last page", () => {
    const p = paginate(rows, 4);
    assert.deepEqual(p.items, Array.from({ length: 21 }, (_, i) => 75 + i));
    assert.deepEqual({ page: p.page, pageCount: p.pageCount, from: p.from, to: p.to, total: p.total },
      { page: 4, pageCount: 4, from: 76, to: 96, total: 96 });
  });

  it("clamps out-of-range pages to the first and last", () => {
    assert.equal(paginate(rows, 0).page, 1);
    assert.equal(paginate(rows, -3).page, 1);
    assert.equal(paginate(rows, 999).page, 4);
    assert.equal(paginate(rows, 999).items.length, 21);
    assert.equal(paginate([], 1).page, 1);
  });
});

describe("pageWindow", () => {
  it("keeps first and last with gaps marked as …", () => {
    assert.deepEqual(pageWindow(1, 4), [1, 2, 3, 4]);
    assert.deepEqual(pageWindow(10, 20), [1, "…", 8, 9, 10, 11, 12, "…", 20]);
    assert.deepEqual(pageWindow(1, 1), [1]);
  });
});
