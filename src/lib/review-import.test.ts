import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rowsToReviews } from "./review-import";

describe("review-specific imported fields", () => {
  it("keeps Entity's body, date and decade separate from Freeway Philharmonic", () => {
    const { reviews } = rowsToReviews([
      { Artist: "Entity", Album: "Ghost Train", "Review Date": "June 1995", Rating: "8", "Review Text": "The train whistle opens Entity's Ghost Train." },
      { Artist: "Freeway Philharmonic", Album: "Sonic Detour", "Review Date": "January 1996", Rating: "9", "Review Text": "Freeway Philharmonic plays Chapman Stick." },
    ]);
    assert.equal(reviews[0]?.slug, "entity-ghost-train");
    assert.deepEqual(reviews[0]?.body, ["The train whistle opens Entity's Ghost Train."]);
    assert.equal(reviews[0]?.date, "06.01.1995");
    assert.equal(reviews[0]?.decade, "1990s");
    assert.deepEqual(reviews[1]?.body, ["Freeway Philharmonic plays Chapman Stick."]);
    assert.equal(reviews[1]?.date, "01.01.1996");
  });
  it("uses Jan 1996 from the row's Jan-May 1996 period, without using it as a genre", () => {
    const { reviews } = rowsToReviews([{ Artist: "Entity", Album: "Ghost Train", Period: "Jan-May 1996", Rating: "8", Genre: "Rock", "Review Text": "Entity review." }]);
    assert.equal(reviews[0]?.date, "Jan 1996");
    assert.equal(reviews[0]?.decade, "1990s");
    assert.equal(reviews[0]?.genre, "Rock");
  });
});