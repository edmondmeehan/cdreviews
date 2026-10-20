import { describe, expect, test } from "bun:test";
import {
  applicationErrors,
  applicationSchema,
  extractSampleLinks,
  isDuplicateApplicationError,
} from "./contributor-application";

describe("extractSampleLinks", () => {
  test("adds https to bare domains", () => {
    expect(extractSampleLinks("medium.com/@me/review")).toEqual(["https://medium.com/@me/review"]);
  });
  test("ignores plain words", () => {
    expect(extractSampleLinks("just some words")).toEqual([]);
  });
  test("never returns non-http links", () => {
    expect(extractSampleLinks("javascript:alert(1) ftp://x.com/a")).toEqual([]);
  });
  test("strips surrounding punctuation and dedupes", () => {
    expect(extractSampleLinks("(https://a.com/x), https://a.com/x.")).toEqual(["https://a.com/x"]);
  });
});

describe("applicationSchema", () => {
  const base = { name: "Jo", email: "Jo@Example.com ", samples: "https://a.com/x", note: "" };
  test("accepts a valid application and lowercases email", () => {
    const r = applicationSchema.parse(base);
    expect(r.email).toBe("jo@example.com");
    expect(r.note).toBeNull();
  });
  test("requires at least one link in samples", () => {
    expect(applicationErrors({ ...base, samples: "I write a lot" })?.samples).toBeDefined();
  });
  test("caps samples at 2000 characters", () => {
    expect(applicationErrors({ ...base, samples: "https://a.com/" + "x".repeat(2000) })?.samples).toBeDefined();
  });
  test("flags each bad field separately", () => {
    const e = applicationErrors({ name: " ", email: "nope", samples: "" });
    expect(Object.keys(e ?? {}).sort()).toEqual(["email", "name", "samples"]);
  });
});

test("recognises the duplicate-application guard", () => {
  expect(isDuplicateApplicationError("duplicate_application")).toBe(true);
  expect(isDuplicateApplicationError("network down")).toBe(false);
});
