import { prisma } from "@/lib/prisma";
import { DoorControls } from "@/components/door-controls";
import { ACTIVE_TICKET_STATUSES } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function DoorPage() {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { orders: { where: { status: { in: [...ACTIVE_TICKET_STATUSES] } } } } } },
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--heading)]">Door</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Activate an event, then open the scanner on a phone. The camera stays on between tickets.
      </p>
      <DoorControls events={JSON.parse(JSON.stringify(events))} />
    </div>
  );
}
