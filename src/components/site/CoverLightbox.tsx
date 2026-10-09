import { useEffect } from "react";
import type { Review } from "@/lib/cd-data";
import { Cover } from "./Cover";

export function CoverLightbox({
  r,
  onClose,
}: {
  r: Pick<Review, "art" | "artUrl" | "title" | "artist">;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${r.title} cover`}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-bone/95 flex items-center justify-center p-6 md:p-12 cursor-zoom-out"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 md:top-6 md:right-6 text-ink font-mono text-[11px] tracking-[0.25em] uppercase border border-ink/40 px-3 py-2 hover:bg-ink hover:text-bone"
      >
        ✕ Close
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[min(90vh,900px)] aspect-square cursor-default"
      >
        <Cover r={r} className="!w-full !h-full" />
      </div>
    </div>
  );
}
