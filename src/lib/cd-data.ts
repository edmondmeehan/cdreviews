// Centralized mock data for cdreviews.
// All public pages and the admin read from `useCdStore` (cd-store.ts),
// which seeds itself from these arrays on first load.

export type ReviewKind = "bnm" | "bnr" | "review";
export type Decade = "1990s" | "2000s" | "2010s" | "2020s";

export type Review = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  label: string;
  format: string;
  genre: string;
  date: string; // MM.DD.YYYY
  decade: Decade;
  kind: ReviewKind;
  score: number; // 0.0 - 10.0
  art: string; // CSS art class
  byline: string;
  readMins: number;
  pull?: string;
  body: string[]; // paragraphs
  status: "draft" | "published";
  // Bulk-import extras
  labelAddress?: string;
  contact?: string;
  archiveUrl?: string;
  period?: string;
  // Artwork + Spotify
  artUrl?: string;
  spotifyUrl?: string;
  spotifyAlbumId?: string;
  spotifyArtistId?: string;
  // Workflow
  createdBy?: string;
  submittedAt?: string;
  previewToken?: string;
};

export type Feature = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  byline: string;
  date: string;
  readMins: number;
  art: string;
  body: string[];
  status: "draft" | "published";
};

export type ListItem = { rank: number; title: string; artist: string; note?: string };
export type CdList = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  byline: string;
  date: string;
  art: string;
  items: ListItem[];
  status: "draft" | "published";
};

export type Contributor = {
  id: string;
  name: string;
  role: "Editor-in-Chief" | "Senior Editor" | "Editor" | "Staff Writer" | "Contributor";
  bio: string;
  city: string;
};

export type Subscriber = {
  id: string;
  email: string;
  signedUp: string; // ISO
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const slug = slugify;

const r = (
  o: Omit<Review, "id" | "slug" | "status"> & Partial<Pick<Review, "status">>,
): Review => ({
  ...o,
  id: slugify(`${o.artist}-${o.title}`),
  slug: slugify(`${o.artist}-${o.title}`),
  status: o.status ?? "published",
});

export const SEED_REVIEWS: Review[] = [
  r({
    title: "Glass Engine", artist: "Lia Thrum", label: "Selo Mint", format: "LP · 9 tracks · 41:08",
    genre: "Electronic", date: "05.04.2026", decade: "2020s", kind: "bnm", score: 8.7, art: "art-1",
    byline: "Maren Okafor", readMins: 7,
    pull: "A debut that argues, very quietly, with the entire idea of a debut.",
    body: [
      "Lia Thrum has spent five years on the periphery of other people's records — a synth credit here, an uncredited vocal there — and Glass Engine plays like a private notebook finally read aloud. The opening minute is just breath and a single sine wave, then a kick that lands so late you feel it in the floor before the speakers.",
      "What follows is forty-one minutes of patient, unromantic electronics. Thrum doesn't drop the bass so much as let it leak. The second half hands the record to a string quartet that sounds, somehow, like it's underwater and grateful for it.",
      "By the closer, a nine-minute exhale called 'Glass, in pieces,' the album has stopped trying to convince you of anything. It's already won.",
    ],
  }),
  r({
    title: "Plain Songs", artist: "Marcia Velour", label: "Hardly Quiet", format: "EP · 6 tracks · 22:14",
    genre: "Folk", date: "05.03.2026", decade: "2020s", kind: "review", score: 7.9, art: "art-2",
    byline: "Iden Park", readMins: 5,
    body: [
      "Six songs, twenty-two minutes, one acoustic guitar that occasionally remembers it has friends. Velour writes the kind of song that sounds like a postcard and reads like a letter.",
      "The EP closes with 'County Road,' which is the best thing she has ever written and possibly the saddest.",
    ],
  }),
  r({
    title: "Reentry", artist: "Kosmo Gardens", label: "Bow Hill Records", format: "LP · 11 tracks · 47:22",
    genre: "Experimental", date: "05.02.2026", decade: "2020s", kind: "bnm", score: 9.1, art: "art-hero",
    byline: "Maren Okafor", readMins: 12,
    pull: "It listens back. That is the whole trick of it — every note feels like the album is paying attention to you.",
    body: [
      "Three decades after their first transmission, Kosmo Gardens return with Reentry: a record that refuses the familiar comforts of the comeback, opting instead for something stranger, slower, and more luminous.",
      "It is the kind of album that rewires the room around it. The opening track 'Approach' arrives as a six-minute glide, all soft attacks and quiet decay. By the time the vocals enter, three songs in, you have already been recalibrated.",
      "The center of the record is 'Perigee,' a duet between a piano that has been left out in the rain and a saxophone that knows it. The closer, 'Reentry,' is a minor miracle — eleven minutes that feel like four.",
      "If the band's debut was a transmission, this is the long-awaited reply. It listens back.",
    ],
  }),
  r({
    title: "Wading", artist: "Halflit", label: "Constellation", format: "LP · 7 tracks · 38:00",
    genre: "Ambient", date: "05.02.2026", decade: "2020s", kind: "review", score: 7.4, art: "art-3",
    byline: "S. Kabir", readMins: 6,
    body: [
      "An ambient record that respects your time. Halflit's third LP is 38 minutes of slow, considered drone work that never overstays.",
    ],
  }),
  r({
    title: "Antenna", artist: "Field Pulse", label: "Dirty Hit", format: "LP · 11 tracks · 44:50",
    genre: "Pop", date: "04.30.2026", decade: "2020s", kind: "review", score: 6.8, art: "art-5",
    byline: "Tess Holloway", readMins: 5,
    body: [
      "Field Pulse swing for the radio and connect about half the time. The other half is clever enough to forgive.",
    ],
  }),
  r({
    title: "Ovum", artist: "Tamarind State", label: "Numero", format: "2xLP · 14 tracks · 76:11",
    genre: "Post-Punk", date: "04.28.2026", decade: "2020s", kind: "bnr", score: 8.9, art: "art-4",
    byline: "B. Solène Marquet", readMins: 9,
    body: [
      "Numero's reissue of Tamarind State's lost 1983 double LP is everything a reissue should be: lavish, contextualizing, slightly defiant.",
      "Across 76 minutes the band invents three separate genres and refuses credit for any of them.",
    ],
  }),
  r({
    title: "Kin", artist: "The Hours After", label: "Verve", format: "LP · 8 tracks · 52:09",
    genre: "Jazz", date: "04.27.2026", decade: "2020s", kind: "review", score: 8.2, art: "art-6",
    byline: "Iden Park", readMins: 7,
    body: ["A jazz record that knows it is one and is not embarrassed about it."],
  }),
  r({
    title: "Atlas Tape", artist: "Moss & Wire", label: "Self-Released", format: "LP · 13 tracks · 49:30",
    genre: "Hip-Hop", date: "04.26.2026", decade: "2020s", kind: "review", score: 8.0, art: "art-7",
    byline: "Tess Holloway", readMins: 6,
    body: ["Self-released, sharply edited, and uncommonly funny. The verse on 'Cartography' alone earns the price."],
  }),
  r({
    title: "Slow Carriage", artist: "Vellum Pines", label: "Drag City", format: "LP · 10 tracks · 41:00",
    genre: "Indie Rock", date: "11.12.2018", decade: "2010s", kind: "review", score: 7.8, art: "art-2",
    byline: "Maren Okafor", readMins: 5,
    body: ["A second album that knows what to keep from the first."],
  }),
  r({
    title: "Halogen", artist: "Court & Spark", label: "4AD", format: "LP · 9 tracks · 38:21",
    genre: "Dream Pop", date: "06.04.2015", decade: "2010s", kind: "bnm", score: 8.5, art: "art-8",
    byline: "B. Solène Marquet", readMins: 6,
    body: ["A reverb-soaked record with surprisingly sharp edges underneath."],
  }),
  r({
    title: "Mire", artist: "The Lemonheads", label: "Fire", format: "LP · 12 tracks · 44:10",
    genre: "Alternative", date: "09.21.2012", decade: "2010s", kind: "bnr", score: 8.3, art: "art-3",
    byline: "Iden Park", readMins: 7,
    body: ["A reissue that finally treats this odd, lovely record with the care it always deserved."],
  }),
  r({
    title: "Ferrous", artist: "Iron Pigeon", label: "Sub Pop", format: "LP · 10 tracks · 36:42",
    genre: "Garage Rock", date: "03.30.2007", decade: "2000s", kind: "review", score: 7.1, art: "art-7",
    byline: "Tess Holloway", readMins: 4,
    body: ["Loud, fast, occasionally clever. A perfectly cromulent garage record."],
  }),
  r({
    title: "Late Bloom", artist: "Jenna Holst", label: "Matador", format: "LP · 11 tracks · 44:29",
    genre: "Singer-Songwriter", date: "08.14.2003", decade: "2000s", kind: "review", score: 8.0, art: "art-2",
    byline: "B. Solène Marquet", readMins: 6,
    body: ["A late-summer record that earns its title twice over."],
  }),
  r({
    title: "Ardent", artist: "Big Star", label: "Rhino", format: "2xLP · 18 tracks · 71:00",
    genre: "Power Pop", date: "02.10.2001", decade: "2000s", kind: "bnr", score: 9.2, art: "art-4",
    byline: "Maren Okafor", readMins: 9,
    body: ["The Big Star reissue we deserved. Pristine, generous, and finally honest about the messiness."],
  }),
  r({
    title: "Sleeve & Sleeve", artist: "Vespertine Six", label: "Tigerhand", format: "CD/LP · 9 tracks · 38:14",
    genre: "Post-Rock / Slowcore", date: "05.06.1996", decade: "1990s", kind: "bnm", score: 8.4, art: "art-archive",
    byline: "B. Solène Marquet", readMins: 6,
    pull: "A debut that knew exactly what it was.",
    body: [
      "For most of its 38 minutes Sleeve & Sleeve refuses to raise its voice. The Brooklyn quartet's debut is built from quiet asymmetries — a guitar line that won't quite resolve, a snare that arrives a fraction late on purpose, a singer who treats every word as if it might break in her hands.",
      "The record knows it could be louder. It refuses the offer. By the closing track, an eight-minute exhalation called 'Sleeve, Reprise,' you understand exactly why: this is a band more interested in the room after the song ends than in the song itself.",
    ],
  }),
  r({
    title: "Quiet County", artist: "Marisol Tien", label: "Mo'Wax", format: "LP · 10 tracks · 47:18",
    genre: "Trip-Hop", date: "10.02.1998", decade: "1990s", kind: "review", score: 8.1, art: "art-8",
    byline: "Iden Park", readMins: 7,
    body: ["A trip-hop record that takes its time and is rewarded for it."],
  }),
];

const f = (
  o: Omit<Feature, "id" | "slug" | "status"> & Partial<Pick<Feature, "status">>,
): Feature => ({ ...o, id: slugify(o.title), slug: slugify(o.title), status: o.status ?? "published" });

export const SEED_FEATURES: Feature[] = [
  f({
    title: "How a record becomes a place",
    dek: "On the strange architecture of the listening room — and why we still believe in albums.",
    byline: "B. Solène Marquet", date: "05.05.2026", readMins: 14, art: "art-hero",
    body: [
      "There is a corner of every serious listener's life that is just a chair, a pair of speakers, and the patience to be alone with something.",
      "This is an essay about that corner.",
    ],
  }),
  f({
    title: "Thirty years of the score system",
    dek: "An internal memo, leaked to ourselves, on what 7.4 has ever meant.",
    byline: "Editorial", date: "04.28.2026", readMins: 8, art: "art-4",
    body: [
      "Our score system was set in November 1995 and has been, in defiance of every internet trend since, unchanged.",
      "Here is what we still mean by it.",
    ],
  }),
  f({
    title: "The Brooklyn quartet that refused to be loud",
    dek: "Vespertine Six, thirty years on, talk about Sleeve & Sleeve.",
    byline: "Maren Okafor", date: "04.21.2026", readMins: 18, art: "art-archive",
    body: [
      "We met in the same Carroll Gardens apartment where the original record was tracked. The carpet was different. Everything else was the same.",
    ],
  }),
];

const l = (
  o: Omit<CdList, "id" | "slug" | "status"> & Partial<Pick<CdList, "status">>,
): CdList => ({ ...o, id: slugify(o.title), slug: slugify(o.title), status: o.status ?? "published" });

export const SEED_LISTS: CdList[] = [
  l({
    title: "The 50 best records of the year so far",
    dek: "Half a year in, half a list. A working document.",
    byline: "Editorial", date: "05.01.2026", art: "art-1",
    items: [
      { rank: 1, title: "Reentry", artist: "Kosmo Gardens", note: "The patient hum of a second life." },
      { rank: 2, title: "Glass Engine", artist: "Lia Thrum" },
      { rank: 3, title: "Ovum (Reissue)", artist: "Tamarind State" },
      { rank: 4, title: "Kin", artist: "The Hours After" },
      { rank: 5, title: "Atlas Tape", artist: "Moss & Wire" },
      { rank: 6, title: "Plain Songs", artist: "Marcia Velour" },
      { rank: 7, title: "Wading", artist: "Halflit" },
      { rank: 8, title: "Antenna", artist: "Field Pulse" },
    ],
  }),
  l({
    title: "Twenty quiet records for a loud spring",
    dek: "An antidote, sequenced.",
    byline: "Iden Park", date: "04.18.2026", art: "art-3",
    items: [
      { rank: 1, title: "Wading", artist: "Halflit" },
      { rank: 2, title: "Plain Songs", artist: "Marcia Velour" },
      { rank: 3, title: "Slow Carriage", artist: "Vellum Pines" },
      { rank: 4, title: "Late Bloom", artist: "Jenna Holst" },
      { rank: 5, title: "Quiet County", artist: "Marisol Tien" },
    ],
  }),
];

export const SEED_CONTRIBUTORS: Contributor[] = [
  { id: "maren", name: "Maren Okafor", role: "Editor-in-Chief", city: "Brooklyn", bio: "Founded the magazine in 1995. Has reviewed approximately 4,200 records and counting." },
  { id: "solene", name: "B. Solène Marquet", role: "Senior Editor", city: "Berlin", bio: "Joined in 1996. Writes about post-rock, slowcore, and the kind of jazz that takes its time." },
  { id: "iden", name: "Iden Park", role: "Editor", city: "Tokyo", bio: "Folk, ambient, and the long quiet weekends." },
  { id: "tess", name: "Tess Holloway", role: "Staff Writer", city: "Brooklyn", bio: "Pop, hip-hop, and the slightly louder weekends." },
  { id: "kabir", name: "S. Kabir", role: "Contributor", city: "London", bio: "Drone, modular, and field recordings." },
];

export const SEED_SUBSCRIBERS: Subscriber[] = [
  { id: "1", email: "reader@example.com", signedUp: "2026-04-12T08:00:00Z" },
  { id: "2", email: "letter@cdreviews.example", signedUp: "2026-04-22T14:31:00Z" },
];

export const DECADE_LABELS: Array<{ key: Decade | "all"; label: string }> = [
  { key: "all", label: "All decades" },
  { key: "1990s", label: "1990s" },
  { key: "2000s", label: "2000s" },
  { key: "2010s", label: "2010s" },
  { key: "2020s", label: "2020s" },
];

export const KIND_LABELS: Array<{ key: ReviewKind | "all"; label: string }> = [
  { key: "all", label: "All types" },
  { key: "bnm", label: "Best New Music" },
  { key: "bnr", label: "Best New Reissue" },
  { key: "review", label: "Standard review" },
];

export const NAV_LINKS: Array<{ label: string; to: string }> = [
  { label: "Today", to: "/" },
  { label: "Reviews", to: "/reviews" },
  { label: "Best New", to: "/best-new" },
  { label: "Features", to: "/features" },
  { label: "Lists", to: "/lists" },
  { label: "Archive", to: "/archive" },
  { label: "Radio", to: "/radio" },
];
