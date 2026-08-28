import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to edit your account." }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Name needs at least 2 characters." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const data: { name: string; passwordHash?: string } = { name };

  if (newPassword || currentPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password needs at least 6 characters." }, { status: 400 });
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Current password is not correct." }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({ ok: true, name });
}
