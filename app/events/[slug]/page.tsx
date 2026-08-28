import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { TicketButton } from "@/components/ticket-button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEventDate, formatMoney } from "@/lib/utils";
import { ACTIVE_TICKET_STATUSES, ticketStockLabel } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { _count: { select: { orders: { where: { status: { in: [...ACTIVE_TICKET_STATUSES] } } } } } },
  });
  if (!event || !event.published) notFound();

  const session = await getServerSession(authOptions);
  const ticketCount = session?.user?.id
    ? await prisma.order.count({
        where: {
          userId: session.user.id,
          eventId: event.id,
          status: { in: [...ACTIVE_TICKET_STATUSES] },
        },
      })
    : 0;
  const remaining = event.capacity ? Math.max(event.capacity - event._count.orders, 0) : null;

  const past = event.startsAt < new Date();
  const isAdmin = session?.user?.role === "admin";
  const stock = ticketStockLabel(event._count.orders, event.capacity, isAdmin);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-[var(--surface-2)] p-6 ring-1 ring-[var(--border)] md:p-8">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            className="mb-6 h-48 w-full rounded-2xl object-cover md:h-64"
          />
        ) : null}
        <p className="text-sm text-[var(--brand)]">{event.location}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--heading)]">{event.title}</h1>
        <p className="mt-3 text-[var(--muted)]">{formatEventDate(event.startsAt)}</p>
        {event.accessCodeEnabled ? (
          <p className="mt-2 text-sm text-[var(--brand)]">Exclusive event</p>
        ) : null}
        <p className="mt-6 whitespace-pre-wrap leading-7">{event.description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
          <div>
            <div className="text-xl font-bold text-[var(--heading)]">
              {formatMoney(event.priceCents, event.currency)}
            </div>
            {stock ? (
              <div className="mt-1 text-sm">
                {isAdmin ? `${stock} tickets out` : stock}
              </div>
            ) : null}
          </div>
          <TicketButton
            eventId={event.id}
            slug={event.slug}
            title={event.title}
            imageUrl={event.imageUrl}
            priceCents={event.priceCents}
            ticketCount={ticketCount}
            remaining={remaining}
            past={past}
            requiresAccessCode={event.accessCodeEnabled}
          />
        </div>
      </div>
    </div>
  );
}
