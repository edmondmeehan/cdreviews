import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Throws unless the signed-in user is staff (admin/editor) or a writer. */
export async function assertStaffOrWriter(supabase: SupabaseClient<Database>, userId: string) {
  const [staff, writer] = await Promise.all([
    supabase.rpc("is_staff", { _user_id: userId }),
    supabase.rpc("is_writer", { _user_id: userId }),
  ]);
  if (!staff.data && !writer.data) throw new Error("You don't have permission to look up artwork.");
}
