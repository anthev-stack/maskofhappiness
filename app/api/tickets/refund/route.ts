import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRequestRefund } from "@/lib/tickets";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to request a refund." }, { status: 401 });
  }

  const body = await request.json();
  const orderId = String(body.orderId ?? "");
  const reason = String(body.reason ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 400 });
  }
  if (reason.length < 4) {
    return NextResponse.json({ error: "Please tell us why you want a refund." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { event: true },
  });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }
  if (!["paid", "claimed"].includes(order.status)) {
    return NextResponse.json({ error: "This ticket is not eligible for a refund." }, { status: 400 });
  }
  if (order.usedAt) {
    return NextResponse.json({ error: "Checked-in tickets cannot be refunded." }, { status: 400 });
  }
  if (!canRequestRefund(order.event.startsAt)) {
    return NextResponse.json(
      { error: "Refunds close 48 hours before the event." },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "refund_pending",
      refundReason: reason,
      refundRequestedAt: new Date(),
      refundReviewedAt: null,
    },
  });

  return NextResponse.json({ order: updated });
}
