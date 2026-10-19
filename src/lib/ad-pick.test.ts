import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pickAd, isRunning, clickRate } from "./ad-pick";

const base = { active: true, weight: 1, starts_at: null, ends_at: null };
const now = new Date("2026-10-14T12:00:00Z");

describe("ad picking", () => {
  it("only picks ads for the requested placement", () => {
    const ads = [{ ...base, id: "a", placement: "footer_strip" }, { ...base, id: "b", placement: "home_break" }];
    assert.equal(pickAd(ads, "home_break", 0.1, now)?.id, "b");
  });
  it("skips paused, not-yet-started and ended ads", () => {
    assert.equal(isRunning({ ...base, id: "x", placement: "home_break", active: false }, now), false);
    assert.equal(isRunning({ ...base, id: "x", placement: "home_break", starts_at: "2026-10-15T00:00:00Z" }, now), false);
    assert.equal(isRunning({ ...base, id: "x", placement: "home_break", ends_at: "2026-10-14T00:00:00Z" }, now), false);
  });
  it("returns nothing when no ad is running, so the spot disappears", () => {
    assert.equal(pickAd([], "list_card", 0.5, now), null);
  });
  it("weights rotation: weight 3 vs 1 takes the first 75%", () => {
    const ads = [{ ...base, id: "heavy", placement: "home_break", weight: 3 }, { ...base, id: "light", placement: "home_break" }];
    assert.equal(pickAd(ads, "home_break", 0.74, now)?.id, "heavy");
    assert.equal(pickAd(ads, "home_break", 0.76, now)?.id, "light");
  });
  it("computes click rate", () => {
    assert.equal(clickRate(200, 3), "1.5%");
    assert.equal(clickRate(0, 0), "—");
  });
});
