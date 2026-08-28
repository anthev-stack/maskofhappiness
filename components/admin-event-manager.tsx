"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { randomAccessCode } from "@/lib/access-code";

type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  priceCents: number;
  capacity: number | null;
  published: boolean;
  activated: boolean;
  imageUrl: string | null;
  accessCodeEnabled: boolean;
  accessCode: string;
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function uploadImage(file: File | null) {
  if (!file || file.size === 0) return null;
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not upload image.");
  return data.url as string;
}

export function EventManager({ events }: { events: EventItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(events);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [exclusive, setExclusive] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  useEffect(() => {
    setItems(events);
  }, [events]);

  useEffect(() => {
    setExclusive(Boolean(editing?.accessCodeEnabled));
    setAccessCode(editing?.accessCodeEnabled && editing.accessCode ? editing.accessCode : "");
  }, [editing]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setBusy(true);
    try {
      const data = new FormData(form);
      const price = Number(data.get("price") || 0);
      const imageUrl = (await uploadImage(data.get("image") as File | null)) ?? editing?.imageUrl ?? null;
      const payload = {
        id: editing?.id,
        title: data.get("title"),
        description: data.get("description"),
        location: data.get("location"),
        startsAt: data.get("startsAt"),
        endsAt: data.get("endsAt") || null,
        priceCents: Math.round(price * 100),
        capacity: data.get("capacity") ? Number(data.get("capacity")) : null,
        published: true,
        imageUrl,
        accessCodeEnabled: exclusive,
        accessCode: exclusive ? accessCode : "",
      };
      const res = await fetch("/api/admin/events", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not save event.");
        return;
      }
      const saved = json.event as EventItem;
      setItems((current) =>
        editing ? current.map((item) => (item.id === saved.id ? { ...item, ...saved } : item)) : [saved, ...current]
      );
      form.reset();
      setEditing(null);
      setExclusive(false);
      setAccessCode("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save event.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDoor(item: EventItem) {
    const res = await fetch("/api/admin/events/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, activated: !item.activated }),
    });
    const data = await res.json();
    if (!res.ok) return;
    setItems((current) =>
      current.map((row) => (row.id === item.id ? { ...row, activated: data.event.activated } : row))
    );
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch("/api/admin/events", {
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
        <h2 className="text-lg font-bold text-[var(--heading)]">{editing ? "Edit event" : "New event"}</h2>
        <div>
          <label>Title</label>
          <input name="title" required defaultValue={editing?.title ?? ""} />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" rows={4} defaultValue={editing?.description ?? ""} />
        </div>
        <div>
          <label>Location</label>
          <input name="location" required defaultValue={editing?.location ?? ""} />
        </div>
        <div>
          <label>Starts</label>
          <input name="startsAt" type="datetime-local" required defaultValue={toLocalInput(editing?.startsAt ?? null)} />
        </div>
        <div>
          <label>Ends</label>
          <input name="endsAt" type="datetime-local" defaultValue={toLocalInput(editing?.endsAt ?? null)} />
        </div>
        <div>
          <label>Price (AUD, 0 = free)</label>
          <input name="price" type="number" min="0" step="0.01" defaultValue={editing ? (editing.priceCents / 100).toFixed(2) : "0"} />
        </div>
        <div>
          <label>Capacity (optional)</label>
          <input name="capacity" type="number" min="1" defaultValue={editing?.capacity ?? ""} />
        </div>
        <div>
          <label>Cover photo</label>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
          {editing?.imageUrl ? (
            <p className="mt-1 text-xs text-[var(--muted)]">Leave empty to keep the current photo.</p>
          ) : null}
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--heading)]">
          <input
            type="checkbox"
            checked={exclusive}
            onChange={(event) => {
              const on = event.target.checked;
              setExclusive(on);
              if (on && !accessCode) setAccessCode(randomAccessCode());
            }}
            className="h-4 w-4"
          />
          Access code
        </label>
        {exclusive ? (
          <div>
            <label>6 digit access code</label>
            <div className="flex gap-2">
              <input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                required
                className="font-mono tracking-[0.3em]"
              />
              <button
                type="button"
                onClick={() => setAccessCode(randomAccessCode())}
                className="shrink-0 rounded-xl bg-[var(--surface-4)] px-3 text-sm text-[var(--heading)]"
              >
                New code
              </button>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">Share this only with people you want to invite.</p>
          </div>
        ) : null}
        {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
        <button disabled={busy} className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-bold text-[#032012] disabled:opacity-60">
          {busy ? "Saving…" : editing ? "Save changes" : "Publish event"}
        </button>
        {editing ? (
          <button
            type="button"
            className="w-full rounded-xl bg-[var(--surface-4)] py-2 text-sm text-[var(--heading)]"
            onClick={() => {
              setExclusive(false);
              setAccessCode("");
              setEditing(null);
            }}
          >
            Cancel edit
          </button>
        ) : null}
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-[var(--surface-2)] p-4 ring-1 ring-[var(--border)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[var(--surface-4)] font-black text-[var(--brand)]">
                    {item.title.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-[var(--heading)]">{item.title}</h3>
                  <p className="mt-1 text-sm">{item.location}</p>
                  <p className="text-sm">{toLocalInput(item.startsAt).replace("T", " ")}</p>
                  <p className="text-sm">{item.priceCents ? `$${(item.priceCents / 100).toFixed(2)}` : "Free"}</p>
                  {item.accessCodeEnabled ? (
                    <p className="mt-1 font-mono text-sm tracking-widest text-[var(--heading)]">
                      Exclusive · {item.accessCode}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => toggleDoor(item)}
                  className={`rounded-xl px-3 py-1.5 text-sm ${
                    item.activated
                      ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "bg-[var(--surface-4)] text-[var(--heading)]"
                  }`}
                >
                  {item.activated ? "Door open" : "Activate"}
                </button>
                {item.activated ? (
                  <Link
                    href={`/admin/scan/${item.id}`}
                    className="rounded-xl bg-[var(--brand)] px-3 py-1.5 text-center text-sm font-semibold text-[#032012]"
                  >
                    Scan tickets
                  </Link>
                ) : null}
                <button onClick={() => setEditing(item)} className="rounded-xl bg-[var(--surface-4)] px-3 py-1.5 text-sm text-[var(--heading)]">
                  Edit
                </button>
                <button onClick={() => remove(item.id)} className="rounded-xl bg-[var(--surface-4)] px-3 py-1.5 text-sm text-[#ff6984]">
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
