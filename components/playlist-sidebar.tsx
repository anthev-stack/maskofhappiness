import { spotifyEmbedUrl } from "@/lib/utils";

type Playlist = {
  id: string;
  title: string;
  description: string;
  spotifyUrl: string;
};

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const embed = spotifyEmbedUrl(playlist.spotifyUrl);

  return (
    <div className="overflow-hidden rounded-2xl bg-[var(--surface-2)] ring-1 ring-[var(--border)]">
      <div className="px-4 pt-4">
        <h3 className="font-semibold text-[var(--heading)]">{playlist.title}</h3>
        {playlist.description ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{playlist.description}</p>
        ) : null}
      </div>
      {embed ? (
        <iframe
          className="mt-3 block h-[152px] w-full"
          src={embed}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={playlist.title}
        />
      ) : (
        <a
          className="m-4 inline-block text-sm text-[var(--brand)]"
          href={playlist.spotifyUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Spotify
        </a>
      )}
    </div>
  );
}

export function PlaylistSidebar({
  playlists,
  layout = "sidebar",
  title = "Listen with us",
  blurb = "The brand is built around sharing and listening. These are the playlists we are on right now.",
  showHeading = true,
}: {
  playlists: Playlist[];
  layout?: "sidebar" | "grid";
  title?: string;
  blurb?: string;
  showHeading?: boolean;
}) {
  const isGrid = layout === "grid";

  return (
    <aside id="listen" className="space-y-3">
      {showHeading ? (
        <div>
          <h2 className="text-lg font-bold text-[var(--heading)]">{title}</h2>
          {blurb ? <p className="mt-1 text-sm text-[var(--muted)]">{blurb}</p> : null}
        </div>
      ) : null}
      {playlists.length === 0 ? (
        <div className="rounded-2xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)] ring-1 ring-[var(--border)]">
          Playlists will land here soon.
        </div>
      ) : (
        <div className={isGrid ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </aside>
  );
}
