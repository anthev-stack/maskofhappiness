import { PlaylistSidebar } from "@/components/playlist-sidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ListenPage() {
  const [playlists, setting] = await Promise.all([
    prisma.playlist.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.setting.findUnique({ where: { id: "site" } }),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <h1 className="mb-2 text-3xl font-extrabold uppercase text-[var(--heading)]">Listen</h1>
      {setting?.listenBlurb ? (
        <p className="mb-8 max-w-2xl text-sm text-[var(--muted)]">{setting.listenBlurb}</p>
      ) : (
        <div className="mb-8" />
      )}
      <PlaylistSidebar
        playlists={playlists}
        layout="grid"
        title={setting?.listenTitle}
        blurb=""
        showHeading={false}
      />
    </div>
  );
}
