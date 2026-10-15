import { youtubeVideoId } from "@/lib/youtube";

export function YouTubeVideo({ url, title }: { url?: string; title: string }) {
  const id = youtubeVideoId(url);
  if (!id) return null;
  return (
    <div className="w-full min-w-0 space-y-3">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={`YouTube video — ${title}`}
        className="block aspect-video w-full border-0"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer" className="inline-block font-mono text-[11px] uppercase text-vermil hover:text-ink">
        ↗ Watch on YouTube
      </a>
    </div>
  );
}