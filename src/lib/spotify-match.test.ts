import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchesSpotifyAlbum } from "./spotify-match";

describe("automatic Spotify artwork identity", () => {
  it("rejects the wrong artist even when the album title matches", () => {
    assert.equal(matchesSpotifyAlbum({ name: "Mac Charles", artists: [{ id: "wrong", name: "Warner Classics" }] }, "Mac Charles", "Mac Charles"), false);
  });
  it("rejects the wrong title even when the artist matches", () => {
    assert.equal(matchesSpotifyAlbum({ name: "Sonic Detour", artists: [{ id: "entity", name: "Entity" }] }, "Entity", "Ghost Train"), false);
  });
  it("accepts both matching identities ignoring case and whitespace", () => {
    assert.equal(matchesSpotifyAlbum({ name: " Ghost Train ", artists: [{ id: "entity", name: "ENTITY" }] }, "Entity", "Ghost Train"), true);
  });
});