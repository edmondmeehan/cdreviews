import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/beehiiv";
// Eddie's Newsletter — the site's single beehiiv publication.
const PUBLICATION_ID = "pub_93412481-4ea2-4ea8-b75a-95e787c5b7a1";

const subscribeInput = z.object({
  email: z.string().trim().email().max(255),
});

export const subscribeToBeehiiv = createServerFn({ method: "POST" })
  .inputValidator(subscribeInput)
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const connectionKey = process.env.BEEHIIV_API_KEY;
    if (!lovableKey || !connectionKey) {
      console.error("beehiiv subscribe: missing LOVABLE_API_KEY or BEEHIIV_API_KEY");
      return { ok: false as const, error: "Newsletter service is not configured" };
    }

    const res = await fetch(
      `${GATEWAY_URL}/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connectionKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          send_welcome_email: true,
          reactivate_existing: true,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`beehiiv subscribe failed [${res.status}]: ${body}`);
      return { ok: false as const, error: `Newsletter signup failed (${res.status})` };
    }
    return { ok: true as const };
  });

export interface NewsletterIssue {
  id: string;
  title: string;
  subtitle: string;
  webUrl: string;
  publishedAt: string | null;
  previewText: string;
}

export type NewsletterIssuesResult =
  | { ok: true; issues: NewsletterIssue[] }
  | { ok: false; error: string; issues: NewsletterIssue[] };

const NEWSLETTER_ARCHIVE_URL = "https://cdreviews.beehiiv.com";

/** Past published issues of the site newsletter, newest first. Read on demand. */
export const listNewsletterIssues = createServerFn({ method: "GET" }).handler(
  async (): Promise<NewsletterIssuesResult> => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const connectionKey = process.env.BEEHIIV_API_KEY;
    if (!lovableKey || !connectionKey) {
      console.error("beehiiv posts: missing LOVABLE_API_KEY or BEEHIIV_API_KEY");
      return { ok: false, error: "Newsletter service is not configured", issues: [] };
    }

    const url = new URL(`${GATEWAY_URL}/publications/${PUBLICATION_ID}/posts`);
    url.searchParams.set("limit", "20");
    url.searchParams.set("order_by", "post_date");
    url.searchParams.set("direction", "desc");

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": connectionKey },
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`beehiiv posts failed [${res.status}]: ${body}`);
        return { ok: false, error: `Newsletter archive unavailable (${res.status})`, issues: [] };
      }
      const json = (await res.json()) as {
        data?: Array<{
          id: string;
          title: string;
          subtitle?: string;
          status: string;
          publish_date?: number | null;
          preview_text?: string;
          web_url?: string;
        }>;
      };
      const issues = (json.data ?? [])
        .filter((p) => p.status === "published" && p.web_url)
        .map((p) => ({
          id: p.id,
          title: p.title || "Untitled issue",
          subtitle: p.subtitle ?? "",
          webUrl: p.web_url!,
          publishedAt: p.publish_date ? new Date(p.publish_date * 1000).toISOString() : null,
          previewText: p.preview_text ?? "",
        }));
      return { ok: true, issues };
    } catch (err) {
      console.error("beehiiv posts request failed:", err);
      return { ok: false, error: "Newsletter archive unavailable", issues: [] };
    }
  },
);
