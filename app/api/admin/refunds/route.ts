import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body.id ?? "");
  const action = String(body.action ?? "");
  if (!id || !["approve", "deny"].includes(action)) {
    return NextResponse.json({ error: "Invalid refund action." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.status !== "refund_pending") {
    return NextResponse.json({ error: "This refund is no longer pending." }, { status: 400 });
  }

  const restored = order.amountCents > 0 ? "paid" : "claimed";
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: action === "approve" ? "refunded" : restored,
      refundReviewedAt: new Date(),
    },
  });

  return NextResponse.json({ order: updated });
}
