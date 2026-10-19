import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { trafficBounds, totalViews, weeklyChange } from "./desk-metrics";

describe("desk traffic calculations", () => {
  it("sums page views rather than page counts", () => {
    assert.equal(totalViews([{ path: "/", views: 148 }, { path: "/radio", views: 81 }]), 229);
    assert.equal(totalViews([]), 0);
  });
  it("compares weekly totals without inventing a percentage for an empty previous week", () => {
    assert.equal(weeklyChange(150, 100), 50);
    assert.equal(weeklyChange(50, 100), -50);
    assert.equal(weeklyChange(229, 0), null);
  });
  it("includes today in the seven and thirty calendar-day ranges", () => {
    const bounds = trafficBounds(new Date(2026, 9, 15, 19, 18));
    assert.equal(new Date(bounds.today).getDate(), 15);
    assert.equal(new Date(bounds.week).getDate(), 9);
    assert.equal(new Date(bounds.previousWeek).getDate(), 2);
    assert.equal(new Date(bounds.month).getDate(), 16);
    assert.equal(new Date(bounds.month).getMonth(), 8);
    assert.equal(new Date(bounds.week).getHours(), 0);
  });
});