import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/bits";

export const Route = createFileRoute("/admin/guide")({
  staticData: { sitemap: false },
  head: () => pageMeta("Admin guide — Admin — cdreviews.", "How to use the cdreviews editorial desk."),
  component: AdminGuide,
});

const SECTIONS = [
  { id: "getting-in", title: "Getting in" },
  { id: "overview", title: "Overview" },
  { id: "reviews", title: "Reviews" },
  { id: "content", title: "Features, Lists, Homepage & Radio" },
  { id: "community", title: "Community reviews" },
  { id: "business", title: "Audience & business" },
  { id: "team", title: "Team" },
  { id: "maintenance", title: "Maintenance mode" },
  { id: "habits", title: "Good habits & troubleshooting" },
] as const;

function Section({ id, title, lead, children }: { id: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-ink/10 pt-8 space-y-4">
      <h2 className="fr-display text-[32px] sm:text-[40px] text-ink">{title}</h2>
      <p className="fr-dek text-[17px] text-ink/80 max-w-[70ch]">{lead}</p>
      {children}
    </section>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return <h3 className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil pt-2">{children}</h3>;
}

function Items({ items }: { items: Array<[ReactNode, ReactNode]> }) {
  return (
    <ul className="space-y-2.5 max-w-[78ch]">
      {items.map(([term, desc], i) => (
        <li key={i} className="text-[15px] leading-relaxed text-ink/80">
          <span className="text-ink font-semibold">{term}</span> {desc}
        </li>
      ))}
    </ul>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] font-mono text-[11px] border border-ink/10">
        <thead>
          <tr className="text-left text-ink/50 tracking-[0.15em] uppercase text-[10px] border-b border-ink/10">
            {head.map((h) => <th key={h} className="py-2.5 px-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ink/5">
              {r.map((c, j) => <td key={j} className={`py-2.5 px-3 ${j === 0 ? "text-ink" : "text-ink/70"}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const B = ({ children }: { children: ReactNode }) => <strong className="text-ink font-semibold">{children}</strong>;

function AdminGuide() {
  return (
    <div className="space-y-10">
      <AdminHeader title="Admin guide" />
      <p className="fr-dek text-[18px] text-ink/80 max-w-[70ch]">
        What every part of the editorial desk does. If a menu item or button below is missing for you, your role doesn't include it.
      </p>

      <nav aria-label="Guide sections" className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border border-ink/20 text-ink/70 hover:text-ink hover:border-ink">
            {s.title}
          </a>
        ))}
      </nav>

      <Section id="getting-in" title="Getting in" lead="The desk lives at cdreviews.com/admin, and what you see depends on your role.">
        <Items items={[
          ["Sign in", <>at <Link to="/auth" className="text-vermil hover:underline">/auth</Link> with your email and password. New accounts must click the confirmation email first. Use <B>Forgot password</B> on the sign-in page if you need a reset.</>],
          ["Getting access:", <>an admin adds you from <Link to="/admin/roles" className="text-vermil hover:underline">Roles &amp; access</Link>. Without an account, you get an invite email to set a password.</>],
        ]} />
        <Table
          head={["Role", "Write reviews", "Publish", "Lists, ads, radio, homepage, subscribers, team", "Roles & access"]}
          rows={[
            ["Super admin", "Yes", "Yes", "Yes", "Yes, plus maintenance mode"],
            ["Admin", "Yes", "Yes", "Yes", "Yes"],
            ["Editor", "Yes", "Yes", "Yes", "No"],
            ["Senior writer", "Yes", "Yes", "No", "No"],
            ["Writer", "Drafts only", "No (submits for approval)", "No", "No"],
            ["Contributor", "No", "No", "No", "No (no desk access)"],
          ]}
        />
      </Section>

      <Section id="overview" title="Overview" lead="The desk home page: counts, traffic, recent changes, and what's waiting on you. Everything you edit saves straight to the live site; drafts stay hidden until published.">
        <Items items={[
          ["Counts row:", "totals for Reviews, Features, Lists, Contributors and Subscribers. Click one to jump to it."],
          ["Maintenance panel", "(super admins only): takes the site offline for readers. See Maintenance mode below."],
          ["Traffic", <>(staff): views today, last 7 and 30 days, and the week's most-read reviews. <B>All pages →</B> opens Top pages.</>],
          ["Recent changes", <>(staff): the last 8 edits across the desk, with who made them. <B>View all →</B> opens the Change log.</>],
          ["My drafts:", "reviews you started that aren't published yet."],
          ["Awaiting approval:", <>drafts writers have submitted. If you can publish, click <B>Publish</B> right there.</>],
        ]} />
      </Section>

      <Section id="reviews" title="Reviews" lead="Find a review, fix its cover, edit it, and publish. Everyone with desk access can open Reviews; only publishers can publish, unpublish or delete.">
        <Sub>The reviews list</Sub>
        <Items items={[
          ["Search box:", "type an artist, album, label, genre or status. Results update as you type."],
          ["Cover column:", <>a thumbnail of each cover. A red dashed <B>No cover</B> box means there isn't one; click it to open the review.</>],
          ["All reviews / Missing cover:", "filter to only reviews without a cover. The counts update live."],
          ["◎ Find missing covers:", "checks every review without a cover, Spotify first, then Discogs. Exact artist + album matches only, about a second per Discogs lookup, and it reports how many came from each."],
          ["Unpublish all without a cover:", "moves every published review with no cover back to drafts. Nothing is deleted."],
          ["Bulk actions:", <>tick rows (or the header box for the whole page), then <B>Publish</B>, <B>Unpublish</B> or <B>Delete</B>. Delete can't be undone.</>],
          ["↑ Bulk import:", "add many reviews at once from a spreadsheet (below)."],
          ["+ New review:", "start a blank review."],
        ]} />
        <Sub>Editing a review</Sub>
        <Items items={[
          ["Basics:", <>title, artist, label, format, genre, review date, decade, score (0–10), byline, read time and type (<B>Standard review</B>, <B>Best New Music</B> or <B>Best New Reissue</B>). Best New picks appear on the Best New page.</>],
          ["Body:", <>one paragraph per line, with a blank line between paragraphs. <B>Pull quote</B> is optional and shows as the highlighted quote.</>],
          ["✦ Spell check & clean up with AI:", <>suggests fixes to the review text. Review the suggestions, then <B>Apply</B> or <B>Discard</B>.</>],
          ["Cover artwork:", <><B>↻ Pull from Spotify</B> (falls back to Discogs), <B>↻ Pull from Discogs</B>, <B>Search Spotify</B> to pick from results, <B>↑ Upload image</B>, or paste an <B>Image URL</B>. <B>Sleeve art</B> is the designed placeholder shown when there's no image.</>],
          ["Players:", "the Spotify album URL and artist ID add Spotify players under the review. An optional YouTube link embeds a video."],
          ["Status:", <>Draft or Published. <B>Schedule publish</B> sets a date and time; the review goes live within the hour after it.</>],
          ["Copy preview link:", "a private link that shows the draft to someone without an account."],
          ["Submit for approval", <>(writers): flags your draft for an editor. <B>Withdraw from approval</B> takes it back.</>],
          ["Save", "stores your changes. Nothing goes live until the status is Published."],
        ]} />
        <Sub>Bulk import</Sub>
        <p className="text-[15px] leading-relaxed text-ink/80 max-w-[78ch]">
          Upload a .csv or .xlsx file of reviews. Download the template (<B>↓ .csv</B> or <B>↓ .xlsx</B>) so the columns match. The importer shows a preview with warnings before anything is saved, so check it before you confirm.
        </p>
      </Section>

      <Section id="content" title="Features, Lists, Homepage & Radio" lead="These pages control the rest of the site's editorial content. Writers can work on Features; the other three are for editors and admins.">
        <Items items={[
          ["Features:", <>longer essays and interviews. <B>+ New feature</B>, then title, dek (the one-line summary under the title), byline, date, read time and body (paragraphs separated by blank lines). Set Status to Published when ready.</>],
          ["Lists:", <>ranked lists like year-end picks. <B>+ New list</B> with a title, dek, byline and date, then <B>+ Add entry</B> for each record in rank order. <B>Remove</B> drops an entry.</>],
          ["Homepage feature:", <>chooses the review in the big spot at the top of the homepage. <B>Search reviews</B>, pick one, optionally add a headline and short intro, set a start date and time (empty = now), then <B>Schedule</B>. With nothing scheduled, the homepage shows its default pick. Draft reviews won't show until published.</>],
          ["Radio:", "sets the CDR Radio page: playlist name, description and the Spotify playlist link (in Spotify: Share → Copy link to playlist)."],
        ]} />
      </Section>

      <Section id="community" title="Community reviews" lead="Reader reviews and star ratings from CritiqueBrainz (part of MusicBrainz) appear under “From the community” on each review page. They are not written by cdreviews, and each one is credited to its author.">
        <Items items={[
          ["How it works:", "the first time someone opens a review, the site finds that album on MusicBrainz and pulls its reader reviews and rating. They refresh once a day. Only reviews licensed for commercial use (CC BY-SA) are shown, because the site carries ads."],
          ["Where to manage it:", <><Link to="/admin/community" className="text-vermil hover:underline">Community reviews</Link> (staff) lists every published review with its match, review count and rating. Filter by what's showing, unmatched or not checked yet.</>],
          ["Wrong album?", <>click <B>Set match</B>, use <B>Search MusicBrainz ↗</B> to find the right album, and paste its release-group link (musicbrainz.org/release-group/…). <B>Hide</B> removes the section from that review; <B>Re-check</B> runs the automatic match again.</>],
          ["Match next 10 unchecked", "matches albums nobody has opened yet, about 20 seconds per batch."],
          ["Changes take up to an hour", "to show for every visitor."],
        ]} />
      </Section>

      <Section id="business" title="Audience & business" lead="Staff-only pages that show who's reading and run the site's advertising.">
        <Items items={[
          ["Top pages:", <>which pages got the most views: <B>Today</B>, <B>7 days</B>, <B>30 days</B>, <B>All time</B>, or <B>Pick dates</B>.</>],
          ["Subscribers:", <>everyone signed up for the newsletter, with the date. <B>Export CSV</B> downloads the list; <B>Remove</B> deletes one person.</>],
          ["Ads:", <><B>New ad</B>, then advertiser, headline, short description, button text, image and link. Choose a <B>Spot</B>, set Status to Active, and optionally a start and end date. <B>Rotation weight</B> sets how often an ad shows when several share a spot (higher = more often). The list shows views, clicks and rate. Empty spots stay hidden on the site.</>],
        ]} />
        <Table
          head={["Spot", "Where it shows", "Image size"]}
          rows={[
            ["Homepage break", "Wide band between homepage sections", "About 1600×800 (2:1)"],
            ["Inside review text", "After the third paragraph of a review", "About 1200×630"],
            ["Review sidebar", "Beside the review, wide screens only", "About 600×600"],
            ["Archive / search lists", "A sponsored row in the list", "Small square"],
            ["Footer strip", "One line above the footer, every page", "None"],
          ]}
        />
        <p className="text-[15px] leading-relaxed text-ink/80 max-w-[78ch]">
          <B>Ad code</B> (Google AdSense and similar) runs on every visitor's page. Only paste code that comes straight from the ad network.
        </p>
      </Section>

      <Section id="team" title="Team" lead="Who writes for cdreviews, who can use the desk, and what they've changed.">
        <Items items={[
          ["Contributors:", <>the people shown on the Masthead. <B>+ Add contributor</B> with name, role, city and bio. This is the public listing only; it doesn't give desk access.</>],
          ["Writer applications:", <>submissions from the Write for us form. <B>Reply by email</B> to answer, or <B>Delete</B> once handled.</>],
          ["Roles & access", <>(admins only): enter an email, pick a role, then <B>Grant / invite</B>. People without an account get an invite to set a password. The list shows each person's role, <B>Last signed in</B> (hover for the exact time; "Never" means they haven't accepted the invite), and when access was granted. <B>Revoke</B> removes a role.</>],
          ["Change log", <>(staff): every create, edit and delete on reviews, features, lists, contributors, ads, the homepage feature, radio, site settings and roles, with who did it, when, and which fields changed. Filter by type at the top; <B>Load older changes</B> goes further back. It only covers changes made since it was switched on.</>],
        ]} />
      </Section>

      <Section id="maintenance" title="Maintenance mode" lead="Takes the whole public site offline and shows readers a splash page instead. Only super admins see this panel, on the Overview.">
        <ol className="list-decimal pl-5 space-y-2 text-[15px] leading-relaxed text-ink/80 max-w-[78ch]">
          <li>Type the message readers should see, then <B>Save message</B>.</li>
          <li>Click <B>Turn on maintenance mode</B> and confirm. The panel then reads "Under maintenance — readers see the splash page."</li>
          <li>While it's on, signed-in writers and staff still see the full site, with a red banner saying maintenance mode is on.</li>
          <li>Click <B>Bring site back online</B> when you're done.</li>
        </ol>
        <p className="text-[15px] leading-relaxed text-ink/80 max-w-[78ch]">
          Use it for big changes or emergencies, not routine edits. Every switch is recorded in the Change log.
        </p>
      </Section>

      <Section id="habits" title="Good habits & troubleshooting" lead="A few rules that keep the site clean and the Change log useful.">
        <Items items={[
          ["Save before you leave a review.", "Changes aren't kept until you click Save."],
          ["Draft first, publish when ready.", "Drafts never show to readers. Use Copy preview link to show someone a draft."],
          ["Check covers after a lookup.", "Automatic lookups only accept exact matches, but glance at the result before publishing."],
          ["Use bulk Delete carefully.", "It can't be undone. Unpublishing is the safe way to hide something."],
          ["Give the lowest role that works.", "Writers can't publish; editors can't change roles. Only give admin to people who need it."],
          ["Don't share logins.", "Each person should have their own account so the Change log shows who did what."],
          ["A button is missing:", "your role doesn't include it. Ask an admin."],
          ['"You don\'t have permission" on a cover lookup:', "you need to be signed in as a writer or above."],
          ["Something changed and you don't know why:", <>check the <Link to="/admin/activity" className="text-vermil hover:underline">Change log</Link> for who changed it and when.</>],
        ]} />
      </Section>
    </div>
  );
}
