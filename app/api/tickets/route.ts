import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { issueTickets } from "@/lib/issue-tickets";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to get a ticket." }, { status: 401 });
  }

  const body = await request.json();
  const result = await issueTickets({
    userId: session.user.id,
    eventId: String(body.eventId ?? ""),
    quantity: Number(body.quantity ?? 1),
    accessCode: body.accessCode,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ orders: result.orders });
}
