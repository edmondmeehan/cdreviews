import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const ROLES = ["admin", "editor", "senior_writer", "writer", "contributor"] as const;
export type Role = (typeof ROLES)[number];

export async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export async function findUserByEmail(email: string) {
  const target = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;
  while (page < 50) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const match = data.users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
  return null;
}
