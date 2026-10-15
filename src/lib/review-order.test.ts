import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byNewest, byOldest, dateKey, mostRecent } from "./review-order";

const mk = (date: string, title = "Album") =>
  ({ id: title + date, slug: title, title, artist: "A", date }) as never;

describe("dateKey", () => {
  it("reorders MM.DD.YYYY into a chronologically comparable key", () => {
    assert.equal(dateKey("05.06.2026"), "20260506");
    assert.equal(dateKey("1.09.1995"), "19950109");
    assert.equal(dateKey(" 12.31.2005 "), "20051231");
  });

  it("returns empty for missing or malformed dates", () => {
    assert.equal(dateKey(""), "");
    assert.equal(dateKey("Undated"), "");
    assert.equal(dateKey("2005-12-31"), "");
  });
});

describe("byNewest", () => {
  it("puts January 2006 after December 2005, unlike string sorting", () => {
    const dec = mk("12.31.2005", "Late 2005");
    const jan = mk("01.01.2006", "Early 2006");
    // The string trap: "12.31.2005" > "01.01.2006", so a naive sort leads with 2005.
    assert.ok("12.31.2005".localeCompare("01.01.2006") > 0);
    assert.deepEqual([dec, jan].sort(byNewest).map((r) => r.title), ["Early 2006", "Late 2005"]);
  });

  it("sorts whole archive years in order and keeps equal days stable", () => {
    const rows = [mk("05.06.2026", "Now"), mk("01.31.2008", "2008"), mk("11.27.2007", "2007")];
    assert.deepEqual([...rows].reverse().sort(byNewest).map((r) => r.title), ["Now", "2008", "2007"]);
    assert.deepEqual([mk("03.02.2001", "Z"), mk("03.02.2001", "A")].sort(byNewest).map((r) => r.title), ["A", "Z"]);
  });

  it("pushes undated reviews to the end", () => {
    const rows = [mk("Undated", "Mystery"), mk("01.01.2006", "Dated")];
    assert.deepEqual(rows.sort(byNewest).map((r) => r.title), ["Dated", "Mystery"]);
  });
});

describe("byOldest", () => {
  it("is the exact mirror of byNewest", () => {
    const rows = [mk("05.06.2026", "Now"), mk("12.31.2005", "Old"), mk("01.31.2008", "Mid")];
    assert.deepEqual(rows.sort(byNewest).map((r) => r.title), ["Now", "Mid", "Old"]);
    assert.deepEqual(rows.sort(byOldest).map((r) => r.title), ["Old", "Mid", "Now"]);
  });
});

describe("mostRecent", () => {
  it("returns only the newest N and leaves the input untouched", () => {
    const rows = [
      mk("12.31.2005", "Old"),
      mk("05.06.2026", "New"),
      mk("01.31.2008", "Mid"),
      mk("11.27.2007", "Older"),
    ];
    const before = rows.map((r) => r.title);
    assert.deepEqual(mostRecent(rows, 2).map((r) => r.title), ["New", "Mid"]);
    assert.deepEqual(rows.map((r) => r.title), before);
    assert.equal(mostRecent(rows, 99).length, 4);
    assert.deepEqual(mostRecent(rows, 0), []);
  });
});
