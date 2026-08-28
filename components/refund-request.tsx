"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefundRequest({
  orderId,
  eligible,
  pending,
  refunded,
  closed,
}: {
  orderId: string;
  eligible: boolean;
  pending: boolean;
  refunded: boolean;
  closed?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (refunded) {
    return <p className="mt-4 text-sm text-[var(--muted)]">This ticket was refunded.</p>;
  }
  if (pending) {
    return <p className="mt-4 text-sm text-[var(--muted)]">Refund requested. Waiting for admin approval.</p>;
  }
  if (closed) {
    return <p className="mt-4 text-sm text-[var(--muted)]">Refunds close 48 hours before the event.</p>;
  }
  if (!eligible) return null;

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/tickets/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not request a refund.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-sm text-[var(--muted)] hover:text-[var(--heading)]"
      >
        Request refund
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <label>Reason</label>
      <textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} />
      {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[#032012] disabled:opacity-60"
        >
          {busy ? "Sending…" : "Submit refund request"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl bg-[var(--surface-4)] px-4 py-2 text-sm text-[var(--heading)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
