import { prisma } from "@/lib/prisma";
import { PlaylistManager } from "@/components/admin-playlist-manager";

export const dynamic = "force-dynamic";

export default async function AdminPlaylistsPage() {
  const playlists = await prisma.playlist.findMany({ orderBy: { sortOrder: "asc" } });
  return <PlaylistManager playlists={playlists} />;
}
