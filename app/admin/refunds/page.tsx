import { prisma } from "@/lib/prisma";
import { AdminRefunds } from "@/components/admin-refunds";

export const dynamic = "force-dynamic";

export default async function AdminRefundsPage() {
  const orders = await prisma.order.findMany({
    where: { refundRequestedAt: { not: null } },
    include: { user: true, event: true },
    orderBy: { refundRequestedAt: "desc" },
  });

  return <AdminRefunds orders={JSON.parse(JSON.stringify(orders))} />;
}
