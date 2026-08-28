import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const HEX = /^#([0-9a-fA-F]{6})$/;

function optionalUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const themeColor = String(body.themeColor ?? "#080808").trim();
  if (!HEX.test(themeColor)) {
    return NextResponse.json({ error: "Pick a valid theme colour." }, { status: 400 });
  }

  const data = {
    seoTitle: String(body.seoTitle ?? "").trim() || "maskofhappiness",
    seoDescription: String(body.seoDescription ?? "").trim(),
    seoKeywords: String(body.seoKeywords ?? "").trim(),
    ogImageUrl: optionalUrl(body.ogImageUrl),
    faviconUrl: optionalUrl(body.faviconUrl),
    appleIconUrl: optionalUrl(body.appleIconUrl),
    themeColor: themeColor.toLowerCase(),
    appleAppTitle: String(body.appleAppTitle ?? "").trim() || "maskofhappiness",
  };

  const setting = await prisma.setting.upsert({
    where: { id: "site" },
    update: data,
    create: { id: "site", ...data },
  });

  return NextResponse.json({ setting });
}
