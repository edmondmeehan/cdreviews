import { expect, test } from "bun:test";
import {
  buildSubscriberCsv,
  subscriberExportFilename,
  uniqueSubscriberCount,
} from "./subscriber-export";

const A = "2026-10-01T09:00:00.000Z";
const B = "2026-10-05T12:30:00.000Z";

test("exports a header row and one row per subscriber, newest first", () => {
  const csv = buildSubscriberCsv([
    { email: "ada@example.com", signedUp: A },
    { email: "grace@example.com", signedUp: B },
  ]);
  expect(csv).toBe(
    "email,signed_up\n" +
      "grace@example.com,2026-10-05T12:30:00.000Z\n" +
      "ada@example.com,2026-10-01T09:00:00.000Z\n",
  );
});

test("drops duplicate emails regardless of case and keeps the first casing", () => {
  const csv = buildSubscriberCsv([
    { email: "Ada@Example.com", signedUp: A },
    { email: "ada@example.com", signedUp: B },
    { email: "  ADA@EXAMPLE.COM  ", signedUp: B },
    { email: "lin@example.com", signedUp: B },
  ]);
  const rows = csv.trim().split("\n").slice(1);
  expect(rows).toEqual([
    "lin@example.com,2026-10-05T12:30:00.000Z",
    "Ada@Example.com,2026-10-01T09:00:00.000Z",
  ]);
});

test("skips blank emails and leaves a missing date empty", () => {
  const csv = buildSubscriberCsv([
    { email: "   ", signedUp: A },
    { email: "", signedUp: A },
    { email: "kate@example.com", signedUp: null },
  ]);
  expect(csv).toBe("email,signed_up\nkate@example.com,\n");
});

test("quotes an email that contains a comma so the row cannot split", () => {
  const csv = buildSubscriberCsv([{ email: "we,ird@example.com", signedUp: A }]);
  expect(csv).toBe('email,signed_up\n"we,ird@example.com",2026-10-01T09:00:00.000Z\n');
});

test("accepts a Date object and ignores an unparseable date", () => {
  const csv = buildSubscriberCsv([
    { email: "date@example.com", signedUp: new Date(A) },
    { email: "bad@example.com", signedUp: "not a date" },
  ]);
  const rows = csv.trim().split("\n").slice(1);
  expect(rows[0]).toBe("date@example.com,2026-10-01T09:00:00.000Z");
  expect(rows[1]).toBe("bad@example.com,");
});

test("unique count matches the exported row count", () => {
  const subs = [
    { email: "a@example.com", signedUp: A },
    { email: "A@example.com", signedUp: A },
    { email: " ", signedUp: A },
    { email: "b@example.com", signedUp: A },
  ];
  expect(uniqueSubscriberCount(subs)).toBe(2);
  expect(buildSubscriberCsv(subs).trim().split("\n").length - 1).toBe(2);
});

test("filename is dated so exports do not overwrite each other", () => {
  expect(subscriberExportFilename(new Date("2026-10-10T07:33:00Z"))).toBe(
    "cdreviews-subscribers-2026-10-10.csv",
  );
});
