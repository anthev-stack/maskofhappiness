import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

const HEX = /^#([0-9a-fA-F]{6})$/;

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data: {
    homepageLogoUrl?: string | null;
    homepageLogoSourceUrl?: string | null;
    accentColor?: string;
    listenTitle?: string;
    listenBlurb?: string;
    logoOverlay?: string;
    logoOverlayUppercase?: boolean;
    logoOverlayColor?: string;
    homepageProductIds?: string;
  } = {};

  if ("homepageLogoUrl" in body) {
    data.homepageLogoUrl =
      typeof body.homepageLogoUrl === "string" && body.homepageLogoUrl.trim()
        ? body.homepageLogoUrl.trim()
        : null;
  }
  if ("homepageLogoSourceUrl" in body) {
    data.homepageLogoSourceUrl =
      typeof body.homepageLogoSourceUrl === "string" && body.homepageLogoSourceUrl.trim()
        ? body.homepageLogoSourceUrl.trim()
        : null;
  }
  if ("accentColor" in body) {
    const color = String(body.accentColor ?? "").trim();
    if (!HEX.test(color)) {
      return NextResponse.json({ error: "Pick a valid colour." }, { status: 400 });
    }
    data.accentColor = color.toLowerCase();
  }
  if ("listenTitle" in body) {
    data.listenTitle = String(body.listenTitle ?? "").trim() || "Listen with us";
  }
  if ("listenBlurb" in body) {
    data.listenBlurb = String(body.listenBlurb ?? "").trim();
  }
  if ("logoOverlay" in body) {
    data.logoOverlay = String(body.logoOverlay ?? "").trim();
  }
  if ("logoOverlayUppercase" in body) {
    data.logoOverlayUppercase = Boolean(body.logoOverlayUppercase);
  }
  if ("logoOverlayColor" in body) {
    const color = String(body.logoOverlayColor ?? "").trim();
    if (!HEX.test(color)) {
      return NextResponse.json({ error: "Pick a valid overlay colour." }, { status: 400 });
    }
    data.logoOverlayColor = color.toLowerCase();
  }
  if ("homepageProductIds" in body) {
    const ids = Array.isArray(body.homepageProductIds)
      ? body.homepageProductIds.filter((id: unknown) => typeof id === "string")
      : [];
    data.homepageProductIds = JSON.stringify(ids);
  }

  const setting = await prisma.setting.upsert({
    where: { id: "site" },
    update: data,
    create: {
      id: "site",
      homepageLogoUrl: data.homepageLogoUrl ?? null,
      homepageLogoSourceUrl: data.homepageLogoSourceUrl ?? data.homepageLogoUrl ?? null,
      accentColor: data.accentColor ?? "#e11d48",
      listenTitle: data.listenTitle ?? "Listen with us",
      listenBlurb:
        data.listenBlurb ??
        "The brand is built around sharing and listening. These are the playlists we are on right now.",
      logoOverlay: data.logoOverlay ?? "",
      logoOverlayUppercase: data.logoOverlayUppercase ?? false,
      logoOverlayColor: data.logoOverlayColor ?? "#b0bac5",
      homepageProductIds: data.homepageProductIds ?? "[]",
    },
  });

  return NextResponse.json({ setting });
}
