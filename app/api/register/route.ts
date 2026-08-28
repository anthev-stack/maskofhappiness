import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const password = String(body.password ?? "");

  if (name.length < 2 || !email.includes("@") || password.length < 6) {
    return NextResponse.json(
      { error: "Name, a valid email, and a password of at least 6 characters are required." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "user",
    },
  });

  return NextResponse.json({ ok: true });
}
