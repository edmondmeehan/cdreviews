import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { relatedReviews } from "./related-reviews";

const mk = (slug: string, genre = "Rock", label = "Matador", decade = "1990s") => ({ slug, genre, label, decade });

describe("relatedReviews", () => {
  it("excludes the current review and requires at least one match", () => {
    const cur = mk("a");
    const all = [cur, mk("b"), { slug: "c", genre: "Jazz", label: "Blue Note", decade: "1970s" }];
    const out = relatedReviews(cur, all);
    assert.deepEqual(out.map((r) => r.slug), ["b"]);
  });

  it("ranks genre matches above label-only and decade-only matches", () => {
    const cur = mk("a");
    const all = [
      cur,
      { slug: "decade-only", genre: "Jazz", label: "Blue Note", decade: "1990s" },
      { slug: "label-only", genre: "Jazz", label: "Matador", decade: "1970s" },
      { slug: "genre-only", genre: "Rock", label: "Blue Note", decade: "1970s" },
      { slug: "all-three", genre: "Rock", label: "Matador", decade: "1990s" },
    ];
    const out = relatedReviews(cur, all);
    assert.deepEqual(out.map((r) => r.slug), ["all-three", "genre-only", "label-only", "decade-only"]);
  });

  it("ignores placeholder values like Uncategorized and —", () => {
    const cur = { slug: "a", genre: "Uncategorized", label: "—", decade: "1990s" };
    const all = [cur, { slug: "b", genre: "Uncategorized", label: "—", decade: "1990s" }];
    const out = relatedReviews(cur, all);
    assert.deepEqual(out.map((r) => r.slug), ["b"]); // decade match only
  });

  it("respects the limit", () => {
    const cur = mk("a");
    const all = [cur, ...Array.from({ length: 10 }, (_, i) => mk(`r${i}`))];
    assert.equal(relatedReviews(cur, all, 4).length, 4);
  });
});
