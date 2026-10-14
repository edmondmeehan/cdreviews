import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shareArtworkUrl } from "./review-sharing";

describe("shareArtworkUrl", () => {
  it("preserves the exact HTTPS album artwork including image parameters", () => {
    const url = "https://i.scdn.co/image/album-cover?size=640";
    assert.equal(shareArtworkUrl(url), url);
  });
  it("rejects local, relative, and non-HTTPS artwork", () => {
    for (const value of [null, "", "/assets/cover.jpg", "blob:https://example.com/id", "http://example.com/cover.jpg", "javascript:alert(1)"]) {
      assert.equal(shareArtworkUrl(value), undefined);
    }
  });
  it("rejects artwork URLs containing credentials", () => {
    assert.equal(shareArtworkUrl("https://user:password@example.com/art.jpg"), undefined);
  });
});