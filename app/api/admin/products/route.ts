import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { normalizeVariants } from "@/lib/shop";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

function productFields(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  if (!title) return { error: "Title is required." };
  const variants = normalizeVariants(body.variants);
  const inventory = variants.length
    ? variants.reduce((sum, variant) => sum + variant.inventory, 0)
    : Math.max(0, Number(body.inventory ?? 0) || 0);
  const status = body.status === "draft" ? "draft" : "active";
  return {
    variants,
    data: {
      title,
      description: String(body.description ?? "").trim(),
      imageUrl:
        typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null,
      priceCents: Math.max(0, Math.round(Number(body.priceCents ?? 0))),
      inventory,
      category: String(body.category ?? "").trim(),
      productType: String(body.productType ?? "").trim(),
      status,
    },
  };
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = productFields(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug: `${slugify(parsed.data.title)}-${Date.now().toString(36)}`,
      variants: {
        create: parsed.variants.map((variant, index) => ({
          name: variant.name,
          inventory: variant.inventory,
          sortOrder: index,
        })),
      },
    },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ product });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Product not found." }, { status: 400 });
  const parsed = productFields(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...parsed.data,
      variants: {
        deleteMany: {},
        create: parsed.variants.map((variant, index) => ({
          name: variant.name,
          inventory: variant.inventory,
          sortOrder: index,
        })),
      },
    },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ product });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
