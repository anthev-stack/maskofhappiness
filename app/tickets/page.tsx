import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TicketQr } from "@/components/ticket-qr";
import { WalletButtons } from "@/components/wallet-buttons";
import { RefundRequest } from "@/components/refund-request";
import { formatEventDate, formatMoney, formatOrderStatus } from "@/lib/utils";
import { canRequestRefund } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/tickets");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-extrabold text-[var(--heading)]">My tickets</h1>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="rounded-2xl bg-[var(--surface-2)] p-6 text-sm ring-1 ring-[var(--border)]">
            No tickets yet.{" "}
            <Link className="text-[var(--brand)]" href="/">
              Browse events
            </Link>
          </p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/events/${order.event.slug}`} className="text-lg font-bold text-[var(--heading)]">
                    {order.event.title}
                  </Link>
                  <p className="mt-1 text-sm">{formatEventDate(order.event.startsAt)}</p>
                  <p className="mt-1 text-sm">{order.event.location}</p>
                  <RefundRequest
                    orderId={order.id}
                    eligible={
                      ["paid", "claimed"].includes(order.status) &&
                      !order.usedAt &&
                      canRequestRefund(order.event.startsAt)
                    }
                    closed={
                      !canRequestRefund(order.event.startsAt) &&
                      ["paid", "claimed"].includes(order.status) &&
                      !order.usedAt
                    }
                    pending={order.status === "refund_pending"}
                    refunded={order.status === "refunded"}
                  />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold tracking-widest text-[var(--brand)]">
                        {order.ticketCode}
                      </div>
                      <div className="mt-1 text-sm capitalize">
                        {formatOrderStatus(order.status)} · {formatMoney(order.amountCents)}
                      </div>
                      {order.usedAt ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Already checked in</div>
                      ) : order.status === "refunded" ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Ticket released</div>
                      ) : order.status === "refund_pending" ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Refund waiting for approval</div>
                      ) : (
                        <div className="mt-1 text-xs text-[var(--muted)]">Show this at the door</div>
                      )}
                    </div>
                    {order.status === "refunded" ? null : <TicketQr code={order.ticketCode} />}
                  </div>
                  {order.status === "refunded" ? null : <WalletButtons code={order.ticketCode} />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
