// Builds the subscriber CSV that gets downloaded from admin → Subscribers.
// Newsletter services (Buttondown, Mailchimp, Ghost) want one row per unique
// email, so duplicates and blank rows are dropped here rather than in the UI.

export type SubscriberLike = {
  email: string;
  signedUp: string | Date | null | undefined;
};

export const SUBSCRIBER_CSV_HEADER = "email,signed_up";

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function isoOrEmpty(value: SubscriberLike["signedUp"]): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** Unique subscribers, newest signup first, as CSV text with a header row. */
export function buildSubscriberCsv(subscribers: SubscriberLike[]): string {
  const seen = new Set<string>();
  const rows: { email: string; signedUp: string }[] = [];

  for (const subscriber of subscribers) {
    const email = (subscriber.email ?? "").trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ email, signedUp: isoOrEmpty(subscriber.signedUp) });
  }

  rows.sort((a, b) => {
    if (a.signedUp !== b.signedUp) return a.signedUp < b.signedUp ? 1 : -1;
    return a.email.localeCompare(b.email);
  });

  const lines = [SUBSCRIBER_CSV_HEADER];
  for (const row of rows) lines.push(`${csvCell(row.email)},${csvCell(row.signedUp)}`);
  return lines.join("\n") + "\n";
}

/** Count of rows the export will actually contain (unique, non-blank emails). */
export function uniqueSubscriberCount(subscribers: SubscriberLike[]): number {
  return new Set(
    subscribers.map((s) => (s.email ?? "").trim().toLowerCase()).filter(Boolean),
  ).size;
}

/** e.g. cdreviews-subscribers-2026-10-10.csv */
export function subscriberExportFilename(date: Date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `cdreviews-subscribers-${stamp}.csv`;
}
