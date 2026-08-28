import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractSpotifyId } from "@/lib/utils";

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
  const spotifyUrl = String(body.spotifyUrl ?? "").trim();
  if (!extractSpotifyId(spotifyUrl)) {
    return NextResponse.json(
      { error: "Paste a full Spotify playlist URL." },
      { status: 400 }
    );
  }

  const count = await prisma.playlist.count();
  const playlist = await prisma.playlist.create({
    data: {
      title: String(body.title ?? "Untitled playlist").trim() || "Untitled playlist",
      description: String(body.description ?? ""),
      spotifyUrl,
      sortOrder: count,
    },
  });

  return NextResponse.json({ playlist });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const spotifyUrl = String(body.spotifyUrl ?? "").trim();
  if (!extractSpotifyId(spotifyUrl)) {
    return NextResponse.json(
      { error: "Paste a full Spotify playlist URL." },
      { status: 400 }
    );
  }

  const playlist = await prisma.playlist.update({
    where: { id: body.id },
    data: {
      title: String(body.title ?? "Untitled playlist").trim() || "Untitled playlist",
      description: String(body.description ?? ""),
      spotifyUrl,
    },
  });

  return NextResponse.json({ playlist });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  await prisma.playlist.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
