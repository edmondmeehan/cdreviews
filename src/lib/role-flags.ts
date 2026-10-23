// Single source of truth for what each editorial role may do.
// Mirrors the database helpers (is_staff / is_writer / can_publish) so the UI
// never shows a control the backend would reject.
export type Role = "admin" | "editor" | "senior_writer" | "writer" | "contributor" | "super_admin";

const STAFF: Role[] = ["super_admin", "admin", "editor"];
const PUBLISH: Role[] = ["super_admin", "admin", "editor", "senior_writer"];
const WRITE: Role[] = [...PUBLISH, "writer"];

export function roleFlags(roles: Role[]) {
  const has = (list: Role[]) => roles.some((r) => list.includes(r));
  return {
    isStaff: has(STAFF),
    isAdmin: roles.includes("super_admin") || roles.includes("admin"),
    isSuperAdmin: roles.includes("super_admin"),
    isWriter: has(WRITE),
    canPublish: has(PUBLISH),
  };
}
