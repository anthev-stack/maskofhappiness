import { prisma } from "@/lib/prisma";
import { formatEventDate, formatMoney, formatOrderStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, event: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="overflow-x-auto rounded-2xl bg-[var(--surface-2)] ring-1 ring-[var(--border)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-[var(--border)] text-[var(--heading)]">
          <tr>
            <th className="px-4 py-3 font-semibold">When</th>
            <th className="px-4 py-3 font-semibold">Guest</th>
            <th className="px-4 py-3 font-semibold">Event</th>
            <th className="px-4 py-3 font-semibold">Ticket</th>
            <th className="px-4 py-3 font-semibold">Amount</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Refund</th>
            <th className="px-4 py-3 font-semibold">Checked in</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-3">{formatEventDate(order.createdAt)}</td>
              <td className="px-4 py-3">
                {order.user.name}
                <div className="text-xs">{order.user.email}</div>
              </td>
              <td className="px-4 py-3">{order.event.title}</td>
              <td className="px-4 py-3 font-mono">{order.ticketCode}</td>
              <td className="px-4 py-3">{formatMoney(order.amountCents)}</td>
              <td className="px-4 py-3">{formatOrderStatus(order.status)}</td>
              <td className="px-4 py-3">
                {order.refundRequestedAt ? (
                  <div>
                    <div>{formatEventDate(order.refundRequestedAt)}</div>
                    {order.refundReason ? (
                      <div className="mt-1 max-w-xs text-xs text-[var(--muted)]">{order.refundReason}</div>
                    ) : null}
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                {order.usedAt ? formatEventDate(order.usedAt) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 ? <p className="p-6 text-sm">No orders yet.</p> : null}
    </div>
  );
}
