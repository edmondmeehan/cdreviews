import { describe, expect, it } from "bun:test";
import { matchesDiscogsTitle } from "./discogs-match";

describe("matchesDiscogsTitle", () => {
  it("accepts exact artist and album", () => {
    expect(matchesDiscogsTitle("Mac Charles - Whirlwind", "mac charles", "Whirlwind")).toBe(true);
  });
  it("ignores Discogs numeric disambiguation suffix", () => {
    expect(matchesDiscogsTitle("Entity (2) - Ghost Train", "Entity", "Ghost Train")).toBe(true);
  });
  it("rejects a different album by the same artist", () => {
    expect(matchesDiscogsTitle("Mac Charles - Other Album", "Mac Charles", "Whirlwind")).toBe(false);
  });
  it("rejects a different artist with the same album title", () => {
    expect(matchesDiscogsTitle("Warner Classics - Whirlwind", "Mac Charles", "Whirlwind")).toBe(false);
  });
});
