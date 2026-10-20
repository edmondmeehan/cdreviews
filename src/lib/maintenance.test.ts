import { test } from "node:test";
import assert from "node:assert/strict";
import { isMaintenanceExempt } from "./maintenance";

test("Write for us page stays open during maintenance", () => {
  assert.equal(isMaintenanceExempt("/contribute"), true);
});

test("reader pages stay behind the maintenance splash", () => {
  assert.equal(isMaintenanceExempt("/"), false);
  assert.equal(isMaintenanceExempt("/reviews"), false);
  assert.equal(isMaintenanceExempt("/contributors"), false);
});
