/** Paths that stay reachable for everyone while the site is in maintenance. */
export const MAINTENANCE_EXEMPT_PATHS = ["/admin", "/auth", "/reset-password", "/confirm", "/preview", "/contribute"] as const;

export function isMaintenanceExempt(pathname: string) {
  return MAINTENANCE_EXEMPT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
