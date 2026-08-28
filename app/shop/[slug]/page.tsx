import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/product-detail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product || product.status !== "active") notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <ProductDetail product={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}
