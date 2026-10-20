import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { cdActions } from "@/lib/cd-store";
import { subscribeToBeehiiv } from "@/lib/beehiiv.functions";

const emailSchema = z.string().trim().email().max(255);

export function MaintenanceSplash({ message }: { message: string | null }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) { setStatus("err"); return; }
    setStatus("busy");
    await cdActions.addSubscriber(parsed.data);
    const result = await subscribeToBeehiiv({ data: { email: parsed.data } });
    if (!result.ok) { setStatus("err"); return; }
    setValue("");
    setStatus("ok");
  }

  return (
    <main className="bg-bone text-ink min-h-screen flex flex-col">
      <div className="max-w-[1100px] w-full mx-auto px-6 pt-10 flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase text-mute">
        <span>Independent music criticism</span>
        <span>Est. 1995</span>
      </div>
      <section className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="flex items-end gap-4">
          <h1 className="fr-display-bold text-[clamp(56px,13vw,200px)] leading-none whitespace-nowrap">
            cdreviews<span className="text-vermil">.</span>
          </h1>
          <span className="cd-disc spin flex-none mb-2 w-[clamp(44px,9vw,140px)] h-[clamp(44px,9vw,140px)]" aria-hidden="true" />
        </div>
        <div className="mt-10 border-t-2 border-ink pt-8 grid md:grid-cols-2 gap-10">
          <div>
            <div className="font-mono text-[12px] tracking-[0.12em] uppercase text-vermil">Side B · Under maintenance</div>
            <h2 className="fr-display text-[40px] md:text-[56px] mt-3">
              Flipping the <span className="serif-it">record.</span>
            </h2>
            <p className="mt-4 text-[17px] text-ink-2 max-w-[48ch]">
              {message || "We're doing some work behind the counter. Leave your email and we'll let you know the moment we're back."}
            </p>
          </div>
          <form onSubmit={onSubmit} className="self-end flex flex-wrap gap-3">
            <label htmlFor="splash-email" className="sr-only">Email address</label>
            <input
              id="splash-email"
              type="email"
              required
              autoComplete="email"
              value={value}
              onChange={(e) => { setValue(e.target.value); setStatus("idle"); }}
              placeholder="you@email.com"
              className="flex-[1_1_240px] min-w-0 h-14 px-5 bg-bone-2 text-ink border-2 border-ink font-mono text-[14px] outline-none focus:ring-2 focus:ring-vermil"
            />
            <button disabled={status === "busy"} className="h-14 px-7 bg-vermil text-night font-bold text-[16px] hover:opacity-90 disabled:opacity-60">
              Notify me →
            </button>
            <p className="basis-full font-mono text-[11px] tracking-[0.12em] uppercase min-h-[1em]" aria-live="polite">
              {status === "ok" && "→ You're on the list. See you soon."}
              {status === "err" && "That email doesn't look right — try again."}
            </p>
          </form>
        </div>
      </section>
      <div className="max-w-[1100px] w-full mx-auto px-6 pb-8 flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase text-mute">
        <span>© 1995 — 2026 cdreviews</span>
        <span className="flex gap-6">
          <Link to="/contribute" className="hover:text-vermil">Write for us</Link>
          <Link to="/auth" className="hover:text-vermil">Staff sign in</Link>
        </span>
      </div>
    </main>
  );
}
