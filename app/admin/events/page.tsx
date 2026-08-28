import { prisma } from "@/lib/prisma";
import { EventManager } from "@/components/admin-event-manager";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });
  return <EventManager events={JSON.parse(JSON.stringify(events))} />;
}
