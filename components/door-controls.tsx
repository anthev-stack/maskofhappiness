"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DoorEvent = {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  activated: boolean;
  _count: { orders: number };
};

export function DoorControls({ events }: { events: DoorEvent[] }) {
  const router = useRouter();
  const [items, setItems] = useState(events);

  async function toggle(item: DoorEvent) {
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

  if (items.length === 0) {
    return <p className="mt-6 text-sm text-[var(--muted)]">No published events yet.</p>;
  }

  return (
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl bg-[var(--surface-2)] p-4 ring-1 ring-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[var(--heading)]">{item.title}</h3>
              <p className="mt-1 text-sm">{item.location}</p>
              <p className="text-sm">{item._count.orders} tickets</p>
              <p className={`mt-1 text-sm ${item.activated ? "text-[var(--brand)]" : "text-[var(--muted)]"}`}>
                {item.activated ? "Activated" : "Not active"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => toggle(item)}
                className="rounded-xl bg-[var(--surface-4)] px-3 py-2 text-sm text-[var(--heading)]"
              >
                {item.activated ? "Deactivate" : "Activate event"}
              </button>
              {item.activated ? (
                <Link
                  href={`/admin/scan/${item.id}`}
                  className="rounded-xl bg-[var(--brand)] px-3 py-2 text-center text-sm font-semibold text-[#032012]"
                >
                  Open scanner
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
