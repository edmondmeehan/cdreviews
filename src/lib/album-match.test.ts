import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { albumTitleScore, artistMatches, albumCore } from "./album-match";
import { matchesSpotifyAlbum } from "./spotify-match";
import { matchesDiscogsTitle } from "./discogs-match";

describe("album title variations", () => {
  const yes: Array<[string, string]> = [
    ["Abbey Road (Remastered 2019)", "Abbey Road"],
    ["Pet Sounds - 50th Anniversary Edition", "Pet Sounds"],
    ["Girlfriend", "Girlfriend (Legacy Edition)"],
    ["Wowee Zowee: Sordid Sentinels Edition", "Wowee Zowee"],
    ["Live at Massey Hall 1971", "Live at Massey Hall"],
    ["Strange Form of Life EP", "Strange Form of Life"],
    ["Rock & Roll City", "Rock and Roll City"],
    ["Björk's Debut", "Bjork's Debut"],
    ["Hissing Fauna, Are You the Destroyer?", "Hissing Fauna Are You The Destroyer"],
    ["Rhumba Palace", "Rumba Palace"],
  ];
  for (const [cand, wanted] of yes) it(`matches "${cand}" ↔ "${wanted}"`, () => assert.ok(albumTitleScore(cand, wanted) > 0));
  it("ranks an exact title above a longer variant", () => {
    assert.ok(albumTitleScore("Abbey Road", "Abbey Road") > albumTitleScore("Abbey Road Sessions Live", "Abbey Road"));
  });
  it("rejects a different album", () => {
    assert.equal(albumTitleScore("Other Album", "Whirlwind"), 0);
    assert.equal(albumTitleScore("Sonic Detour", "Ghost Train"), 0);
  });
  it("does not treat one short word as a prefix match", () => {
    assert.equal(albumTitleScore("Blue Lines", "Blue"), 0);
  });
  it("treats 'self-titled' as the artist name", () => {
    assert.ok(albumTitleScore("Film School", "Self-Titled", "Film School") > 0);
  });
  it("cleans packaging off titles", () => {
    assert.equal(albumCore("Sky Blue Sky [Deluxe Edition] (Remastered)"), "sky blue sky");
  });
});

describe("artist variations", () => {
  it("ignores a leading The, & vs and, and accents", () => {
    assert.ok(artistMatches(["Shins"], "The Shins"));
    assert.ok(artistMatches(["Simon and Garfunkel"], "Simon & Garfunkel"));
    assert.ok(artistMatches(["Björk"], "Bjork"));
  });
  it("accepts collaborations when the lead artist matches", () => {
    assert.ok(artistMatches(["Nina Nastasia", "Jim White"], "Nina Nastasia and Jim White"));
    assert.ok(artistMatches(["Chick Corea"], "Chick Corea and Bela Fleck"));
  });
  it("still rejects a different artist", () => {
    assert.equal(artistMatches(["Warner Classics"], "Mac Charles"), false);
  });
});

describe("Spotify and Discogs still require both artist and album", () => {
  it("Spotify: wrong artist with matching title is rejected", () => {
    assert.equal(matchesSpotifyAlbum({ name: "Mac Charles", artists: [{ id: "x", name: "Warner Classics" }] }, "Mac Charles", "Mac Charles"), false);
  });
  it("Spotify: remastered title variant is accepted", () => {
    assert.equal(matchesSpotifyAlbum({ name: "Ghost Train (2011 Remaster)", artists: [{ id: "e", name: "Entity" }] }, "Entity", "Ghost Train"), true);
  });
  it("Discogs: disambiguation suffix and edition variant", () => {
    assert.equal(matchesDiscogsTitle("Entity (2) - Ghost Train (Deluxe Edition)", "Entity", "Ghost Train"), true);
  });
  it("Discogs: same artist, different album is rejected", () => {
    assert.equal(matchesDiscogsTitle("Mac Charles - Other Album", "Mac Charles", "Whirlwind"), false);
  });
});
