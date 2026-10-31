import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { excerpt, isCommercialLicense, pickReleaseGroup, plainParagraphs, usableReviews } from "./musicbrainz";

const rg = (id: string, title: string, artist: string, type = "Album") =>
  ({ id, title, "primary-type": type, "artist-credit": [{ name: artist, artist: { name: artist } }] });

describe("pickReleaseGroup", () => {
  it("matches artist and album", () => {
    assert.equal(pickReleaseGroup([rg("a", "OK Computer", "Radiohead")], "Radiohead", "OK Computer")?.id, "a");
  });
  it("rejects the same title by another artist", () => {
    assert.equal(pickReleaseGroup([rg("a", "Whirlwind", "Someone Else")], "Mac Charles", "Whirlwind"), null);
  });
  it("prefers the album over a single of the same name", () => {
    const groups = [rg("s", "Nevermind", "Nirvana", "Single"), rg("a", "Nevermind", "Nirvana")];
    assert.equal(pickReleaseGroup(groups, "Nirvana", "Nevermind")?.id, "a");
  });
  it("forgives edition suffixes", () => {
    assert.equal(pickReleaseGroup([rg("a", "Abbey Road", "The Beatles")], "Beatles", "Abbey Road (Remastered 2019)")?.id, "a");
  });
});

describe("licenses", () => {
  it("allows BY-SA and refuses NC", () => {
    assert.equal(isCommercialLicense("CC BY-SA 3.0"), true);
    assert.equal(isCommercialLicense("CC BY-NC-SA 3.0"), false);
    assert.equal(isCommercialLicense(undefined), false);
  });
});

describe("usableReviews", () => {
  const text = "A long enough review about the record that says something real about it.";
  it("drops non-commercial, hidden and empty reviews and keeps credit", () => {
    const out = usableReviews([
      { id: "1", text, license: { id: "CC BY-NC-SA 3.0" }, user: { display_name: "x" } },
      { id: "2", text, license: { id: "CC BY-SA 3.0", info_url: "https://creativecommons.org/licenses/by-sa/3.0/" }, user: { id: "u", display_name: "Ana" }, popularity: 3, rating: 4 },
      { id: "3", text, license: { id: "CC BY-SA 3.0" }, is_hidden: true },
      { id: "4", text: "short", license: { id: "CC BY-SA 3.0" } },
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].author, "Ana");
    assert.equal(out[0].url, "https://critiquebrainz.org/review/2");
    assert.equal(out[0].authorUrl, "https://critiquebrainz.org/user/u");
    assert.equal(out[0].rating, 4);
  });
});

describe("plainParagraphs / excerpt", () => {
  it("strips markdown", () => {
    assert.deepEqual(plainParagraphs("# Title\n\nThis is **bold** and [a link](http://x).\n\n> quoted"), ["Title", "This is bold and a link.", "quoted"]);
  });
  it("truncates long text at a word boundary", () => {
    const r = excerpt(["word ".repeat(300).trim()], 100);
    assert.equal(r.truncated, true);
    assert.ok(r.paragraphs[0].endsWith("…"));
    assert.ok(r.paragraphs[0].length <= 102);
  });
});
