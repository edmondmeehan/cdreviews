import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildSubscriberCsv,
  subscriberExportFilename,
  uniqueSubscriberCount,
} from "./subscriber-export";

const A = "2026-10-01T09:00:00.000Z";
const B = "2026-10-05T12:30:00.000Z";

describe("buildSubscriberCsv", () => {
  it("exports a header row and one row per subscriber, newest first", () => {
    const csv = buildSubscriberCsv([
      { email: "ada@example.com", signedUp: A },
      { email: "grace@example.com", signedUp: B },
    ]);
    assert.equal(
      csv,
      "email,signed_up\n" +
        "grace@example.com,2026-10-05T12:30:00.000Z\n" +
        "ada@example.com,2026-10-01T09:00:00.000Z\n",
    );
  });

  it("drops duplicate emails regardless of case and keeps the first casing", () => {
    const csv = buildSubscriberCsv([
      { email: "Ada@Example.com", signedUp: A },
      { email: "ada@example.com", signedUp: B },
      { email: "  ADA@EXAMPLE.COM  ", signedUp: B },
      { email: "lin@example.com", signedUp: B },
    ]);
    const rows = csv.trim().split("\n").slice(1);
    assert.deepEqual(rows, [
      "lin@example.com,2026-10-05T12:30:00.000Z",
      "Ada@Example.com,2026-10-01T09:00:00.000Z",
    ]);
  });

  it("skips blank emails and leaves a missing date empty", () => {
    const csv = buildSubscriberCsv([
      { email: "   ", signedUp: A },
      { email: "", signedUp: A },
      { email: "kate@example.com", signedUp: null },
    ]);
    assert.equal(csv, "email,signed_up\nkate@example.com,\n");
  });

  it("quotes an email that contains a comma so the row cannot split", () => {
    const csv = buildSubscriberCsv([{ email: "we,ird@example.com", signedUp: A }]);
    assert.equal(csv, 'email,signed_up\n"we,ird@example.com",2026-10-01T09:00:00.000Z\n');
  });

  it("accepts a Date object and ignores an unparseable date", () => {
    const csv = buildSubscriberCsv([
      { email: "date@example.com", signedUp: new Date(A) },
      { email: "bad@example.com", signedUp: "not a date" },
    ]);
    const rows = csv.trim().split("\n").slice(1);
    assert.equal(rows[0], "date@example.com,2026-10-01T09:00:00.000Z");
    assert.equal(rows[1], "bad@example.com,");
  });

  it("unique count matches the exported row count", () => {
    const subs = [
      { email: "a@example.com", signedUp: A },
      { email: "A@example.com", signedUp: A },
      { email: " ", signedUp: A },
      { email: "b@example.com", signedUp: A },
    ];
    assert.equal(uniqueSubscriberCount(subs), 2);
    assert.equal(buildSubscriberCsv(subs).trim().split("\n").length - 1, 2);
  });
});

describe("subscriberExportFilename", () => {
  it("is dated so exports do not overwrite each other", () => {
    assert.equal(
      subscriberExportFilename(new Date("2026-10-10T07:33:00Z")),
      "cdreviews-subscribers-2026-10-10.csv",
    );
  });
});
