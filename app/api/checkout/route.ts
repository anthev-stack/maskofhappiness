import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { issueTickets } from "@/lib/issue-tickets";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to check out." }, { status: 401 });
  }

  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];
  const tickets = items.filter((item: { kind?: string }) => item.kind === "ticket");
  const products = items.filter((item: { kind?: string }) => item.kind !== "ticket");

  if (!tickets.length && !products.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  for (const item of tickets) {
    const result = await issueTickets({
      userId: session.user.id,
      eventId: String(item.id ?? ""),
      quantity: Number(item.quantity ?? 1),
      accessCode: item.accessCode,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
  }

  return NextResponse.json({
    ok: true,
    ticketsIssued: true,
    merchPending: products.length > 0,
  });
}
