import { prisma } from "@/lib/prisma";
import { formatEventDate, formatMoney, formatOrderStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const latest = await prisma.order.findMany({
    include: { user: true, event: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
      <h2 className="mb-4 text-lg font-bold text-[var(--heading)]">Latest orders</h2>
      {latest.length === 0 ? (
        <p className="text-sm">No tickets claimed yet.</p>
      ) : (
        <div className="space-y-3">
          {latest.map((order) => (
            <div key={order.id} className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-[var(--heading)]">
                {order.user.name} · {order.event.title}
              </span>
              <span>
                {order.ticketCode} · {formatOrderStatus(order.status)} · {formatMoney(order.amountCents)} ·{" "}
                {formatEventDate(order.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
