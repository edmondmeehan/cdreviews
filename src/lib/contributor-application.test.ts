import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applicationErrors,
  applicationSchema,
  extractSampleLinks,
  isDuplicateApplicationError,
} from "./contributor-application";

describe("extractSampleLinks", () => {
  it("adds https to bare domains", () => {
    assert.deepEqual(extractSampleLinks("medium.com/@me/review"), ["https://medium.com/@me/review"]);
  });
  it("ignores plain words", () => {
    assert.deepEqual(extractSampleLinks("just some words"), []);
  });
  it("never returns non-http links", () => {
    assert.deepEqual(extractSampleLinks("javascript:alert(1) ftp://x.com/a"), []);
  });
  it("strips surrounding punctuation and dedupes", () => {
    assert.deepEqual(extractSampleLinks("(https://a.com/x), https://a.com/x."), ["https://a.com/x"]);
  });
});

describe("applicationSchema", () => {
  const base = { name: "Jo", email: "Jo@Example.com ", samples: "https://a.com/x", note: "" };
  it("accepts a valid application and lowercases email", () => {
    const r = applicationSchema.parse(base);
    assert.equal(r.email, "jo@example.com");
    assert.equal(r.note, null);
  });
  it("requires at least one link in samples", () => {
    assert.ok(applicationErrors({ ...base, samples: "I write a lot" })?.samples);
  });
  it("caps samples at 2000 characters", () => {
    assert.ok(applicationErrors({ ...base, samples: "https://a.com/" + "x".repeat(2000) })?.samples);
  });
  it("flags each bad field separately", () => {
    const e = applicationErrors({ name: " ", email: "nope", samples: "" });
    assert.deepEqual(Object.keys(e ?? {}).sort(), ["email", "name", "samples"]);
  });
});

describe("duplicate guard", () => {
  it("recognises the database's duplicate-application error", () => {
    assert.equal(isDuplicateApplicationError("duplicate_application"), true);
    assert.equal(isDuplicateApplicationError("network down"), false);
  });
});
