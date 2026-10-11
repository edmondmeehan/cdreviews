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
