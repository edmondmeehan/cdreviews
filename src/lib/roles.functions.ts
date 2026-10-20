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
    const lastSignIn: Record<string, string | null> = {};
    // Invited people who haven't accepted yet have never signed in.
    const pending = new Set<string>();
    for (const id of ids) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      if (data?.user) {
        emails[id] = data.user.email ?? "(no email)";
        lastSignIn[id] = data.user.last_sign_in_at ?? null;
        if (!data.user.last_sign_in_at) pending.add(id);
      }
    }
    return roles.map((r) => ({
      ...r,
      email: emails[r.user_id] ?? "(unknown)",
      pending: pending.has(r.user_id),
      lastSignInAt: lastSignIn[r.user_id] ?? null,
    }));
  });

export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().trim().email().max(320),
      role: z.enum(ROLES),
      // Where the invite link lands; must also be listed in the auth redirect URLs.
      redirectTo: z.string().url().max(2048).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let user = await findUserByEmail(data.email);
    let invited = false;
    if (!user) {
      // No account yet: create one and email them a link to set a password.
      const { data: inv, error: invErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        data.redirectTo ? { redirectTo: data.redirectTo } : undefined,
      );
      if (invErr || !inv?.user) throw new Error(`Could not send an invite to ${data.email}: ${invErr?.message ?? "unknown error"}`);
      user = inv.user;
      invited = true;
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role: data.role as Role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true, userId: user.id, email: user.email ?? data.email, invited };
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
