import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Kicker } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";

export const Route = createFileRoute("/radio")({
  component: Radio,
  head: () => pageMeta("CDR Radio — cdreviews.", "A 24-hour listening room curated from three decades of reviews."),
});

function Radio() {
  const published = useCdStore((s) => s.reviews.filter((r) => r.status === "published"));
  const mix = [...published].sort((a, b) => b.score - a.score).slice(0, 10);
  const playable = mix.filter((r) => r.spotifyAlbumId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const current = playable.find((r) => r.id === selectedId) ?? playable[0];

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-20 flex flex-wrap gap-14 items-center">
        <div className="flex-[1_1_520px] min-w-0 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.12em] uppercase text-vermil">
            <span className="live-dot" /> On air · 24 hours
          </div>
          <h1 className="fr-display text-[clamp(64px,9vw,144px)] text-ink">
            CDR <span className="serif-it">Radio.</span>
          </h1>
          <p className="fr-dek text-[19px] md:text-[21px] text-ink-2 max-w-[52ch]">
            A 24-hour listening room. Programmed by the editors, sequenced by the room.
          </p>
          <p className="fr-dek text-[17px] text-mute max-w-[56ch]">
            Radio is the oldest delivery system we know for music criticism — a host, a sequence, an opinion. CDR Radio brings that idea back, curated weekly from three decades of reviews.
          </p>
        </div>
        <div className="flex-[1_1_420px] min-w-0 flex justify-center">
          <div className="relative w-full max-w-[460px] aspect-square">
            <div className="cd-disc spin w-full h-full shadow-[0_30px_80px_rgba(0,0,0,.6)]" aria-hidden="true" />
            <div className="absolute left-1/2 top-1/2 w-[46%] -ml-[23%] h-[2px] overflow-hidden" aria-hidden="true">
              <div className="laser h-[2px] w-full bg-[linear-gradient(90deg,transparent,#ff4a1c,transparent)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-12">
        <div className="bg-bone-warm border border-rule flex flex-wrap">
          <div className="flex-[1_1_520px] min-w-0 p-8 md:p-12 space-y-6">
            <Kicker>Now rotating</Kicker>
            <h2 className="fr-display text-[clamp(40px,4.4vw,64px)] text-ink">
              Top of the <span className="serif-it">stacks.</span>
            </h2>
            <ol className="border-t border-rule">
              {mix.map((m, i) => {
                const isCurrent = current?.id === m.id;
                return (
                  <li key={m.id} className="border-b border-rule flex items-center gap-4 py-3.5">
                    <span className="font-mono text-[11px] w-7 text-mute">{String(i + 1).padStart(2, "0")}</span>
                    <Link
                      to="/reviews/$slug"
                      params={{ slug: m.slug }}
                      className={`flex-1 min-w-0 truncate text-[18px] font-semibold ${isCurrent ? "text-vermil" : "text-ink"} hover:text-vermil`}
                    >
                      {m.artist} <span className="serif-it font-normal text-[20px]">— {m.title}</span>
                    </Link>
                    <span className="font-mono text-[11px] text-mute">{m.score.toFixed(1)}</span>
                    {m.spotifyAlbumId ? (
                      <button
                        type="button"
                        onClick={() => setSelectedId(m.id)}
                        aria-pressed={isCurrent}
                        aria-label={`Play ${m.title} by ${m.artist}`}
                        className={`h-11 w-11 rounded-full flex items-center justify-center text-[13px] border transition-colors ${
                          isCurrent ? "bg-vermil text-night border-vermil" : "border-ink/25 text-ink hover:border-ink"
                        }`}
                      >
                        ▶
                      </button>
                    ) : (
                      <span className="h-11 w-11" aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="flex-[1_1_420px] min-w-0 p-8 md:p-12 border-t md:border-t-0 md:border-l border-rule space-y-5">
            <div className="font-mono text-[12px] tracking-[0.12em] uppercase text-mute">Listening booth</div>
            {current?.spotifyAlbumId ? (
              <>
                <div className="text-[22px] font-semibold">
                  {current.artist} <span className="serif-it font-normal text-[24px]">— {current.title}</span>
                </div>
                <iframe
                  key={current.spotifyAlbumId}
                  title={`${current.title} on Spotify`}
                  src={`https://open.spotify.com/embed/album/${current.spotifyAlbumId}?utm_source=cdreviews&theme=0`}
                  width="100%"
                  height="380"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                />
              </>
            ) : (
              <p className="fr-dek text-[17px] text-ink-2">
                Pick a record from the mix to read the review. Albums matched to Spotify play right here.
              </p>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
