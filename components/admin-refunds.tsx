"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatEventDate, formatMoney } from "@/lib/utils";

type RefundRow = {
  id: string;
  status: string;
  amountCents: number;
  ticketCode: string;
  refundReason: string;
  refundRequestedAt: string | null;
  refundReviewedAt: string | null;
  user: { name: string; email: string };
  event: { title: string };
};

function statusLabel(status: string) {
  if (status === "refund_pending") return "Pending";
  if (status === "refunded") return "Approved";
  return status;
}

export function AdminRefunds({ orders }: { orders: RefundRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function decide(id: string, action: "approve" | "deny") {
    setBusyId(id);
    setError("");
    const res = await fetch("/api/admin/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setBusyId("");
    if (!res.ok) {
      setError(data.error ?? "Could not update refund.");
      return;
    }
    router.refresh();
  }

  const pending = orders.filter((order) => order.status === "refund_pending");
  const rest = orders.filter((order) => order.status !== "refund_pending");

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
      <section>
        <h2 className="mb-3 text-lg font-bold text-[var(--heading)]">Pending refunds</h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl bg-[var(--surface-2)] p-6 text-sm ring-1 ring-[var(--border)]">
            No refund requests waiting.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((order) => (
              <RefundCard
                key={order.id}
                order={order}
                busy={busyId === order.id}
                onApprove={() => void decide(order.id, "approve")}
                onDeny={() => void decide(order.id, "deny")}
              />
            ))}
          </div>
        )}
      </section>
      {rest.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-[var(--heading)]">Reviewed</h2>
          <div className="space-y-3">
            {rest.map((order) => (
              <RefundCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function RefundCard({
  order,
  busy,
  onApprove,
  onDeny,
}: {
  order: RefundRow;
  busy?: boolean;
  onApprove?: () => void;
  onDeny?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-[var(--heading)]">{order.event.title}</p>
          <p className="mt-1 text-sm">
            {order.user.name} · {order.user.email}
          </p>
          <p className="mt-1 text-sm font-mono">{order.ticketCode}</p>
          <p className="mt-1 text-sm">{formatMoney(order.amountCents)}</p>
        </div>
        <div className="text-right text-sm">
          <p className="capitalize text-[var(--heading)]">{statusLabel(order.status)}</p>
          {order.refundRequestedAt ? (
            <p className="mt-1 text-[var(--muted)]">Applied {formatEventDate(new Date(order.refundRequestedAt))}</p>
          ) : null}
          {order.refundReviewedAt ? (
            <p className="mt-1 text-[var(--muted)]">Reviewed {formatEventDate(new Date(order.refundReviewedAt))}</p>
          ) : null}
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--heading)]">{order.refundReason || "No reason given."}</p>
      {onApprove && onDeny ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onApprove}
            className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[#032012] disabled:opacity-60"
          >
            Approve refund
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDeny}
            className="rounded-xl bg-[var(--surface-4)] px-4 py-2 text-sm text-[var(--heading)] disabled:opacity-60"
          >
            Deny
          </button>
        </div>
      ) : null}
    </div>
  );
}
