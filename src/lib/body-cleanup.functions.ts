import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ paragraphs: z.array(z.string().max(20000)).min(1).max(200) });

const INSTRUCTIONS = `You are a careful copy editor for cdreviews, a music review publication founded in 1995.
Clean up the review body you are given:
- Fix clear spelling mistakes, typos, doubled words, stray spaces and obvious punctuation slips.
- Remove leftover markup or junk like {mosimage}, HTML tags, or stray URLs fragments.
- Re-join paragraphs that were split mid-sentence; keep the author's real paragraph breaks.
- Keep artist, album, song and label names exactly as written unless clearly misspelled.
- Preserve the writer's voice, slang, opinions, era-specific wording and sentence structure. Do NOT rewrite, summarise, shorten, add content, or modernise style.
Return the cleaned paragraphs and a short list of the changes you made.`;

export const cleanupReviewBody = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [staff, writer] = await Promise.all([
      supabase.rpc("is_staff", { _user_id: userId }),
      supabase.rpc("is_writer", { _user_id: userId }),
    ]);
    if (!staff.data && !writer.data) throw new Error("You don't have permission to use AI cleanup.");

    // Uses Anthropic's API directly (previously Lovable's AI gateway).
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("AI cleanup isn't set up yet (missing ANTHROPIC_API_KEY).");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        max_tokens: 16000,
        system: INSTRUCTIONS,
        messages: [{ role: "user", content: data.paragraphs.map((p, i) => `[${i + 1}] ${p}`).join("\n\n") }],
        tools: [{
          name: "cleaned_body",
          description: "Return the cleaned review paragraphs and a short list of changes.",
          input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["paragraphs", "changes"],
            properties: {
              paragraphs: { type: "array", items: { type: "string" } },
              changes: { type: "array", items: { type: "string" } },
            },
          },
        }],
        tool_choice: { type: "tool", name: "cleaned_body" },
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      if (res.status === 429 || res.status === 529) throw new Error("AI is busy right now — try again in a minute.");
      throw new Error(`AI cleanup failed (${res.status}). ${msg.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      content?: Array<{ type: string; name?: string; input?: { paragraphs?: string[]; changes?: string[] } }>;
    };
    const out = json.content?.find((c) => c.type === "tool_use" && c.name === "cleaned_body")?.input;
    if (!out?.paragraphs) throw new Error("AI returned no usable result. Please try again.");
    const paragraphs = out.paragraphs.map((p) => p.replace(/^\[\d+\]\s*/, "").trim()).filter(Boolean);
    if (!paragraphs.length) throw new Error("AI returned an empty body.");
    return { paragraphs, changes: (out.changes ?? []).slice(0, 50) };
  });
