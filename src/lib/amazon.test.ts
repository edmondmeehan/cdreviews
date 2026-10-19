import { test } from "node:test";
import assert from "node:assert/strict";
import { amazonSearchUrl } from "./amazon";

test("amazon link carries the cdreviews-20 affiliate tag", () => {
  const u = new URL(amazonSearchUrl("Pavement", "Wowee Zowee"));
  assert.equal(u.searchParams.get("tag"), "cdreviews-20");
  assert.equal(u.searchParams.get("k"), "Pavement Wowee Zowee");
});
