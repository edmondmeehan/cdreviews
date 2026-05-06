// Legacy slug → current slug redirects.
// When old URLs (from prior site versions, retitled pieces, or external
// links) hit a $slug route, we look up the canonical slug here before
// falling back to the not-found page.

export const LEGACY_REVIEW_SLUGS: Record<string, string> = {
  // Old debut-era slugs
  "glass-engine": "lia-thrum-glass-engine",
  "thrum-glass-engine": "lia-thrum-glass-engine",
  "kosmo-gardens-reentry-2026": "kosmo-gardens-reentry",
  "reentry": "kosmo-gardens-reentry",
  "ovum-reissue": "tamarind-state-ovum",
  "tamarind-ovum": "tamarind-state-ovum",
  "plain-songs": "marcia-velour-plain-songs",
  "velour-plain-songs": "marcia-velour-plain-songs",
  "wading-halflit": "halflit-wading",
  "field-pulse-antenna-lp": "field-pulse-antenna",
  "the-hours-after-kin-lp": "the-hours-after-kin",
  "moss-wire-atlas-tape": "moss-and-wire-atlas-tape",
  "vellum-pines-slow-carriage-2018": "vellum-pines-slow-carriage",
  "court-and-spark-halogen": "court-spark-halogen",
  "lemonheads-mire-reissue": "the-lemonheads-mire",
  "iron-pigeon-ferrous-2007": "iron-pigeon-ferrous",
  "jenna-holst-late-bloom-2003": "jenna-holst-late-bloom",
  "big-star-ardent-reissue": "big-star-ardent",
  "vespertine-six-sleeve-and-sleeve": "vespertine-six-sleeve-sleeve",
  "sleeve-and-sleeve": "vespertine-six-sleeve-sleeve",
  "marisol-tien-quiet-county-1998": "marisol-tien-quiet-county",
};

export const LEGACY_FEATURE_SLUGS: Record<string, string> = {
  "record-as-place": "how-a-record-becomes-a-place",
  "the-listening-room": "how-a-record-becomes-a-place",
  "score-system-30-years": "thirty-years-of-the-score-system",
  "what-7-4-means": "thirty-years-of-the-score-system",
  "vespertine-six-at-thirty": "the-brooklyn-quartet-that-refused-to-be-loud",
  "brooklyn-quartet": "the-brooklyn-quartet-that-refused-to-be-loud",
};

export const LEGACY_LIST_SLUGS: Record<string, string> = {
  "best-of-2026-so-far": "the-50-best-records-of-the-year-so-far",
  "50-best-2026": "the-50-best-records-of-the-year-so-far",
  "quiet-records-spring": "twenty-quiet-records-for-a-loud-spring",
  "quiet-spring": "twenty-quiet-records-for-a-loud-spring",
};
