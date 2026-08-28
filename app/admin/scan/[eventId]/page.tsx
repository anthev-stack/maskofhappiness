import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TicketScanner } from "@/components/ticket-scanner";

export const dynamic = "force-dynamic";

export default async function ScanPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-[var(--brand)]">
        Back to events
      </Link>
      <h2 className="mt-3 text-2xl font-extrabold text-[var(--heading)]">Scan tickets</h2>
      <p className="mt-1 text-[var(--muted)]">{event.title}</p>
      {!event.activated ? (
        <p className="mt-6 rounded-2xl bg-[var(--surface-2)] p-6 text-sm ring-1 ring-[var(--border)]">
          Activate this event from the dashboard before scanning.
        </p>
      ) : (
        <div className="mt-6">
          <TicketScanner eventId={event.id} eventTitle={event.title} />
        </div>
      )}
    </div>
  );
}
