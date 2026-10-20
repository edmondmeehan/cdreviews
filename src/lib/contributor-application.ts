// Browser-safe rules for the "Write for us" application, shared by the public
// form, the admin list and tests. The database repeats the hard limits.
import { z } from "zod";

export const APPLICATION_LIMITS = { name: 100, email: 255, samples: 2000, note: 1000 } as const;

const DOMAIN_LINK = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?([/?#]\S*)?$/i;

/** Pull valid http(s) links out of free text; bare domains get https://. */
export function extractSampleLinks(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/[\s,]+/)) {
    const token = raw.replace(/^[(<["']+/, "").replace(/[)>\]"'.,;:!?]+$/, "");
    if (!token || !DOMAIN_LINK.test(token)) continue;
    const withScheme = /^https?:\/\//i.test(token) ? token : `https://${token}`;
    try {
      const url = new URL(withScheme);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      const href = url.href;
      if (!out.includes(href)) out.push(href);
    } catch {
      // not a URL — skip
    }
  }
  return out;
}

export const applicationSchema = z.object({
  name: z.string().trim().min(1, "Add your name").max(APPLICATION_LIMITS.name, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Add your email")
    .email("Enter a valid email")
    .max(APPLICATION_LIMITS.email, "Email is too long")
    .transform((v) => v.toLowerCase()),
  samples: z
    .string()
    .trim()
    .min(1, "Add at least one link to published work")
    .max(APPLICATION_LIMITS.samples, "Keep links under 2,000 characters")
    .refine((v) => extractSampleLinks(v).length > 0, "Add at least one link, like https://…"),
  note: z
    .string()
    .trim()
    .max(APPLICATION_LIMITS.note, "Keep the note under 1,000 characters")
    .optional()
    .transform((v) => (v ? v : null)),
});

export type ApplicationField = keyof z.input<typeof applicationSchema>;
export type ApplicationErrors = Partial<Record<ApplicationField, string>>;

/** First message per field, for inline errors. */
export function applicationErrors(input: unknown): ApplicationErrors | null {
  const parsed = applicationSchema.safeParse(input);
  if (parsed.success) return null;
  const errors: ApplicationErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as ApplicationField;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** The database guard rejects a second application from one email within 24h. */
export function isDuplicateApplicationError(message: string | undefined): boolean {
  return !!message && message.includes("duplicate_application");
}
