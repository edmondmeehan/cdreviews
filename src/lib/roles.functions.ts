import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ROLES, type Role, assertAdmin, findUserByEmail } from "@/server/roles.server";

export const listRoleAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set(roles.map((r) => r.user_id)));
    const emails: Record<string, string> = {};
    for (const id of ids) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      if (data?.user) emails[id] = data.user.email ?? "(no email)";
    }
    return roles.map((r) => ({ ...r, email: emails[r.user_id] ?? "(unknown)" }));
  });

export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().trim().email().max(320),
      role: z.enum(ROLES),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const user = await findUserByEmail(data.email);
    if (!user) throw new Error(`No user found with email ${data.email}. Ask them to sign up first.`);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role: data.role as Role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true, userId: user.id, email: user.email };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("user_roles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
