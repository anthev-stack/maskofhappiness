import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { accessCodesMatch, normalizeAccessCode } from "@/lib/access-code";
import { ACTIVE_TICKET_STATUSES } from "@/lib/tickets";

export async function issueTickets(input: {
  userId: string;
  eventId: string;
  quantity: number;
  accessCode?: string;
}) {
  const quantity = Math.floor(Number(input.quantity) || 0);
  if (quantity < 1 || quantity > 20) {
    return { error: "Choose between 1 and 20 tickets.", status: 400 as const };
  }

  const event = await prisma.event.findUnique({ where: { id: input.eventId } });
  if (!event || !event.published) {
    return { error: "Event not found.", status: 404 as const };
  }
  if (event.startsAt < new Date()) {
    return { error: "This event has already happened.", status: 400 as const };
  }
  if (event.accessCodeEnabled && !accessCodesMatch(event.accessCode, normalizeAccessCode(input.accessCode))) {
    return { error: "That access code is not valid.", status: 403 as const };
  }

  if (event.capacity) {
    const sold = await prisma.order.count({
      where: { eventId: event.id, status: { in: [...ACTIVE_TICKET_STATUSES] } },
    });
    if (sold + quantity > event.capacity) {
      const remaining = Math.max(event.capacity - sold, 0);
      return {
        error: remaining ? `Only ${remaining} ticket${remaining === 1 ? "" : "s"} left.` : "This event is sold out.",
        status: 400 as const,
      };
    }
  }

  const isFree = event.priceCents <= 0;
  const orders = await prisma.$transaction(
    Array.from({ length: quantity }, () =>
      prisma.order.create({
        data: {
          userId: input.userId,
          eventId: event.id,
          status: isFree ? "claimed" : "paid",
          amountCents: event.priceCents,
          ticketCode: nanoid(10).toUpperCase(),
        },
      })
    )
  );

  return { orders, event };
}
