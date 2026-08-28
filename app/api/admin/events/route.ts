import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ACCESS_CODE_PATTERN, normalizeAccessCode } from "@/lib/access-code";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

function accessFields(body: { accessCodeEnabled?: unknown; accessCode?: unknown }) {
  const accessCodeEnabled = Boolean(body.accessCodeEnabled);
  const accessCode = normalizeAccessCode(body.accessCode);
  if (accessCodeEnabled && !ACCESS_CODE_PATTERN.test(accessCode)) {
    return { error: "Exclusive events need a 6 digit access code." };
  }
  return {
    data: {
      accessCodeEnabled,
      accessCode: accessCodeEnabled ? accessCode : "",
    },
  };
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const access = accessFields(body);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      slug: slugify(title) + "-" + Date.now().toString(36),
      description: String(body.description ?? ""),
      location: String(body.location ?? ""),
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      imageUrl: body.imageUrl || null,
      priceCents: Number(body.priceCents ?? 0),
      capacity: body.capacity ? Number(body.capacity) : null,
      published: Boolean(body.published ?? true),
      ...access.data,
    },
  });

  return NextResponse.json({ event });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const access = accessFields(body);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: 400 });
  }

  const event = await prisma.event.update({
    where: { id: body.id },
    data: {
      title: body.title,
      description: body.description,
      location: body.location,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      imageUrl: body.imageUrl || null,
      priceCents: Number(body.priceCents ?? 0),
      capacity: body.capacity ? Number(body.capacity) : null,
      published: Boolean(body.published),
      ...access.data,
    },
  });

  return NextResponse.json({ event });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
