import { EventRow, toEventCard } from "@/components/event-row";
import { EventSection, PreviousEvents } from "@/components/event-list";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ACTIVE_TICKET_STATUSES } from "@/lib/tickets";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const now = new Date();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";
  const [upcoming, previous] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      include: { _count: { select: { orders: { where: { status: { in: [...ACTIVE_TICKET_STATUSES] } } } } } },
    }),
    prisma.event.findMany({
      where: { published: true, startsAt: { lt: now } },
      orderBy: { startsAt: "desc" },
      include: { _count: { select: { orders: { where: { status: { in: [...ACTIVE_TICKET_STATUSES] } } } } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold uppercase text-[var(--heading)]">Events</h1>
      <div className="space-y-8">
        {upcoming.length > 0 ? (
          <EventSection title="Upcoming events" count={upcoming.length}>
            {upcoming.map((event) => (
              <EventRow key={event.id} event={toEventCard(event)} isAdmin={isAdmin} />
            ))}
          </EventSection>
        ) : (
          <p className="rounded-2xl bg-[var(--surface-2)] p-6 text-sm text-[var(--muted)] ring-1 ring-[var(--border)]">
            No upcoming events right now.
          </p>
        )}
        <PreviousEvents previous={previous} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
