import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchesDiscogsTitle } from "./discogs-match";

describe("matchesDiscogsTitle", () => {
  it("accepts exact artist and album", () => {
    assert.equal(matchesDiscogsTitle("Mac Charles - Whirlwind", "mac charles", "Whirlwind"), true);
  });
  it("ignores Discogs numeric disambiguation suffix", () => {
    assert.equal(matchesDiscogsTitle("Entity (2) - Ghost Train", "Entity", "Ghost Train"), true);
  });
  it("rejects a different album by the same artist", () => {
    assert.equal(matchesDiscogsTitle("Mac Charles - Other Album", "Mac Charles", "Whirlwind"), false);
  });
  it("rejects a different artist with the same album title", () => {
    assert.equal(matchesDiscogsTitle("Warner Classics - Whirlwind", "Mac Charles", "Whirlwind"), false);
  });
});
