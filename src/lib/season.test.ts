import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isHalloweenSeason } from "./season";

describe("isHalloweenSeason", () => {
  it("is on from Oct 20 through Nov 1", () => {
    assert.equal(isHalloweenSeason(new Date(2026, 9, 20)), true);
    assert.equal(isHalloweenSeason(new Date(2026, 9, 31, 23)), true);
    assert.equal(isHalloweenSeason(new Date(2026, 10, 1, 12)), true);
  });
  it("is off the rest of the year", () => {
    assert.equal(isHalloweenSeason(new Date(2026, 9, 19)), false);
    assert.equal(isHalloweenSeason(new Date(2026, 10, 2)), false);
    assert.equal(isHalloweenSeason(new Date(2026, 5, 15)), false);
  });
});
