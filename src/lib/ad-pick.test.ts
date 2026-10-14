import { describe, it, expect } from "vitest";
import { pickAd, isRunning, clickRate } from "./ad-pick";

const base = { active: true, weight: 1, starts_at: null, ends_at: null };
const now = new Date("2026-10-14T12:00:00Z");

describe("ad picking", () => {
  it("only picks ads for the requested placement", () => {
    const ads = [{ ...base, id: "a", placement: "footer_strip" }, { ...base, id: "b", placement: "home_break" }];
    expect(pickAd(ads, "home_break", 0.1, now)?.id).toBe("b");
  });
  it("skips paused, not-yet-started and ended ads", () => {
    expect(isRunning({ ...base, id: "x", placement: "home_break", active: false }, now)).toBe(false);
    expect(isRunning({ ...base, id: "x", placement: "home_break", starts_at: "2026-10-15T00:00:00Z" }, now)).toBe(false);
    expect(isRunning({ ...base, id: "x", placement: "home_break", ends_at: "2026-10-14T00:00:00Z" }, now)).toBe(false);
  });
  it("returns nothing when no ad is running, so the spot disappears", () => {
    expect(pickAd([], "list_card", 0.5, now)).toBeNull();
  });
  it("weights rotation: weight 3 vs 1 takes the first 75%", () => {
    const ads = [{ ...base, id: "heavy", placement: "home_break", weight: 3 }, { ...base, id: "light", placement: "home_break" }];
    expect(pickAd(ads, "home_break", 0.74, now)?.id).toBe("heavy");
    expect(pickAd(ads, "home_break", 0.76, now)?.id).toBe("light");
  });
  it("computes click rate", () => {
    expect(clickRate(200, 3)).toBe("1.5%");
    expect(clickRate(0, 0)).toBe("—");
  });
});
