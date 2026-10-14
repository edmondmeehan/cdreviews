import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Calls beehiiv's API directly (previously routed through Lovable's connector gateway).
const BEEHIIV_API = "https://api.beehiiv.com/v2";
// Eddie's Newsletter — the site's single beehiiv publication.
const PUBLICATION_ID = "pub_93412481-4ea2-4ea8-b75a-95e787c5b7a1";

const subscribeInput = z.object({
  email: z.string().trim().email().max(255),
});

export const subscribeToBeehiiv = createServerFn({ method: "POST" })
  .inputValidator(subscribeInput)
  .handler(async ({ data }) => {
    const apiKey = process.env.BEEHIIV_API_KEY;
    if (!apiKey) {
      console.error("beehiiv subscribe: missing BEEHIIV_API_KEY");
      return { ok: false as const, error: "Newsletter service is not configured" };
    }

    const res = await fetch(
      `${BEEHIIV_API}/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
