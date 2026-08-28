import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUsedAt, parseTicketPayload } from "@/lib/ticket";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const eventId = String(body.eventId ?? "");
  const ticketCode = parseTicketPayload(String(body.payload ?? body.ticketCode ?? ""));

  if (!eventId || !ticketCode) {
    return NextResponse.json({
      approved: false,
      reason: "Invalid ticket",
    });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ approved: false, reason: "Invalid ticket" });
  }
  if (!event.activated) {
    return NextResponse.json({
      approved: false,
      reason: "This event is not activated",
    });
  }

  const order = await prisma.order.findUnique({
    where: { ticketCode },
    include: { user: true, event: true },
  });

  if (!order || !["paid", "claimed", "refund_pending"].includes(order.status)) {
    return NextResponse.json({ approved: false, reason: "Invalid ticket" });
  }

  if (order.eventId !== eventId) {
    return NextResponse.json({
      approved: false,
      reason: "Invalid ticket",
      detail: `This ticket is for ${order.event.title}`,
    });
  }

  if (order.usedAt) {
    return NextResponse.json({
      approved: false,
      reason: "Ticket has already been used",
      usedAt: order.usedAt.toISOString(),
      usedAtLabel: formatUsedAt(order.usedAt),
      guest: order.user.name,
    });
  }

  const usedAt = new Date();
  const updated = await prisma.order.updateMany({
    where: { id: order.id, usedAt: null },
    data: { usedAt },
  });

  if (updated.count === 0) {
    const again = await prisma.order.findUnique({ where: { id: order.id } });
    return NextResponse.json({
      approved: false,
      reason: "Ticket has already been used",
      usedAt: again?.usedAt?.toISOString() ?? usedAt.toISOString(),
      usedAtLabel: formatUsedAt(again?.usedAt ?? usedAt),
      guest: order.user.name,
    });
  }

  return NextResponse.json({
    approved: true,
    reason: "Approved",
    guest: order.user.name,
    ticketCode: order.ticketCode,
  });
}
