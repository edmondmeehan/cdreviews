import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RadioSettings = { title: string; description: string; playlist_url: string };

export const RADIO_DEFAULTS: RadioSettings = {
  title: "Fuck It, It's Fall.",
  description:
    "The standing CDR Radio playlist — the same records we argue about in the reviews, sequenced back to back. It updates as the editors rotate the stacks.",
  playlist_url: "https://open.spotify.com/playlist/0Lxt9bg9qMX4He0UDkxRL8",
};

/** Extracts a Spotify playlist id from a share URL, spotify: URI or bare id. */
export function spotifyPlaylistId(input: string): string | null {
  const s = input.trim();
  const m = s.match(/playlist[/:]([A-Za-z0-9]{22})/) ?? s.match(/^([A-Za-z0-9]{22})$/);
  return m ? m[1] : null;
}

export const radioQueryKey = ["radio_settings"];

export function useRadioSettings() {
  return useQuery({
    queryKey: radioQueryKey,
    queryFn: async (): Promise<RadioSettings> => {
      const { data } = await supabase
        .from("radio_settings")
        .select("title, description, playlist_url")
        .eq("id", 1)
        .maybeSingle();
      return data ?? RADIO_DEFAULTS;
    },
    staleTime: 30_000,
  });
}
