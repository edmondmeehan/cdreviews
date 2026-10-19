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

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: INSTRUCTIONS,
        input: data.paragraphs.map((p, i) => `[${i + 1}] ${p}`).join("\n\n"),
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: "cleaned_body",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["paragraphs", "changes"],
              properties: {
                paragraphs: { type: "array", items: { type: "string" } },
                changes: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      }),
    });

    if (!res.ok || !res.body) {
      const msg = await res.text().catch(() => "");
      if (res.status === 402) throw new Error("Out of AI credits — add more in Settings → Plans & credits.");
      if (res.status === 429) throw new Error("AI is busy right now — try again in a minute.");
      throw new Error(`AI cleanup failed (${res.status}). ${msg.slice(0, 200)}`);
    }

    // Consume the SSE stream server-side and collect the output text.
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          if (ev.type === "response.failed" || ev.type === "error") {
            throw new Error(ev.error?.message ?? ev.response?.error?.message ?? "AI cleanup failed.");
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }

    let parsed: { paragraphs: string[]; changes: string[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("AI returned no usable result. Please try again.");
    }
    const paragraphs = parsed.paragraphs.map((p) => p.replace(/^\[\d+\]\s*/, "").trim()).filter(Boolean);
    if (!paragraphs.length) throw new Error("AI returned an empty body.");
    return { paragraphs, changes: parsed.changes.slice(0, 50) };
  });
