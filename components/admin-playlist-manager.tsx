"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Playlist = {
  id: string;
  title: string;
  description: string;
  spotifyUrl: string;
};

export function PlaylistManager({ playlists }: { playlists: Playlist[] }) {
  const router = useRouter();
  const [items, setItems] = useState(playlists);
  const [editing, setEditing] = useState<Playlist | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setItems(playlists);
  }, [playlists]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setBusy(true);
    const data = new FormData(form);
    const res = await fetch("/api/admin/playlists", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing?.id,
        title: data.get("title"),
        description: data.get("description"),
        spotifyUrl: data.get("spotifyUrl"),
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Could not save playlist.");
      return;
    }
    const saved = json.playlist as Playlist;
    setItems((current) =>
      editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved]
    );
    form.reset();
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this playlist from the homepage?")) return;
    await fetch("/api/admin/playlists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((current) => current.filter((item) => item.id !== id));
    if (editing?.id === id) setEditing(null);
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form key={editing?.id ?? "new"} onSubmit={save} className="h-fit space-y-3 rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--heading)]">{editing ? "Edit playlist" : "Add playlist"}</h2>
        <div>
          <label>Title</label>
          <input name="title" required defaultValue={editing?.title ?? ""} />
        </div>
        <div>
          <label>Note</label>
          <input name="description" defaultValue={editing?.description ?? ""} />
        </div>
        <div>
          <label>Spotify playlist URL</label>
          <input
            name="spotifyUrl"
            placeholder="https://open.spotify.com/playlist/..."
            required
            defaultValue={editing?.spotifyUrl ?? ""}
          />
        </div>
        {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
        <button disabled={busy} className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-bold text-[#032012] disabled:opacity-60">
          {busy ? "Saving…" : editing ? "Save changes" : "Add to homepage"}
        </button>
        {editing ? (
          <button
            type="button"
            className="w-full rounded-xl bg-[var(--surface-4)] py-2 text-sm text-[var(--heading)]"
            onClick={() => setEditing(null)}
          >
            Cancel edit
          </button>
        ) : null}
      </form>
      <div className="space-y-3">
        {items.map((playlist) => (
          <div key={playlist.id} className="rounded-2xl bg-[var(--surface-2)] p-4 ring-1 ring-[var(--border)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--heading)]">{playlist.title}</h3>
                {playlist.description ? <p className="mt-1 text-sm">{playlist.description}</p> : null}
                <p className="mt-1 break-all text-sm">{playlist.spotifyUrl}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button onClick={() => setEditing(playlist)} className="rounded-xl bg-[var(--surface-4)] px-3 py-1.5 text-sm text-[var(--heading)]">
                  Edit
                </button>
                <button onClick={() => remove(playlist.id)} className="rounded-xl bg-[var(--surface-4)] px-3 py-1.5 text-sm text-[#ff6984]">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
