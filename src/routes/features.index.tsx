import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";
import { useCdStore } from "@/lib/cd-store";

export const Route = createFileRoute("/features/")({
  component: FeaturesIndex,
  head: () => ({
    meta: [{ title: "Features — cdreviews." }, { name: "description", content: "Long-form essays, interviews and arguments." }],
  }),
});

function FeaturesIndex() {
  const features = useCdStore((s) => s.features.filter((f) => f.status === "published"));
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 04" title="Features." dek="Essays, interviews, arguments — the longer-form work." />
      <section className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {features.map((f) => (
          <Link key={f.id} to="/features/$slug" params={{ slug: f.slug }} className="group space-y-4 border-t border-rule pt-5">
            <div className={`art ${f.art}`} />
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute flex justify-between">
              <span>{f.byline}</span><span>{f.date}</span>
            </div>
            <h2 className="fr-card-title text-[30px] text-ink group-hover:text-vermil transition-colors">{f.title}</h2>
            <p className="fr-blurb text-[16px] text-ink-2">{f.dek}</p>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-vermil">{f.readMins} min →</div>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
