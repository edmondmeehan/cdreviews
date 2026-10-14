import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { roleFlags, type Role } from "./role-flags";

const flags = (...roles: Role[]) => roleFlags(roles);

describe("roleFlags", () => {
  it("gives the super admin every editorial permission", () => {
    assert.deepEqual(flags("super_admin"), { isStaff: true, isAdmin: true, isWriter: true, canPublish: true });
  });

  it("keeps an editor from the admin-only role screen", () => {
    assert.deepEqual(flags("editor"), { isStaff: true, isAdmin: false, isWriter: true, canPublish: true });
  });

  it("lets a senior writer publish but not manage staff-only areas", () => {
    assert.deepEqual(flags("senior_writer"), { isStaff: false, isAdmin: false, isWriter: true, canPublish: true });
  });

  it("lets a writer draft and submit but not publish", () => {
    assert.deepEqual(flags("writer"), { isStaff: false, isAdmin: false, isWriter: true, canPublish: false });
  });

  it("gives contributors and unknown roles no desk access", () => {
    assert.deepEqual(flags("contributor"), { isStaff: false, isAdmin: false, isWriter: false, canPublish: false });
    assert.deepEqual(flags(), { isStaff: false, isAdmin: false, isWriter: false, canPublish: false });
  });
});
