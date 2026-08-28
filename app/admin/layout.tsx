import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/");

  const [events, playlists, orders, refunds, products] = await Promise.all([
    prisma.event.count(),
    prisma.playlist.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "refund_pending" } }),
    prisma.product.count(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <h1 className="text-3xl font-extrabold text-[var(--heading)]">Dashboard</h1>
      <p className="mt-1 text-sm">Create events, manage playlists, and review ticket orders.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat href="/admin/events" label="Events" value={events} />
        <Stat href="/admin/playlists" label="Playlists" value={playlists} />
        <Stat href="/admin/shop" label="Shop" value={products} />
        <Stat href="/admin/orders" label="Orders" value={orders} />
        <Stat href="/admin/refunds" label="Refunds" value={refunds} />
      </div>
      <nav className="mt-6 flex flex-wrap gap-2">
        <Tab href="/admin">Overview</Tab>
        <Tab href="/admin/homepage">Homepage</Tab>
        <Tab href="/admin/events">Events</Tab>
        <Tab href="/admin/playlists">Playlists</Tab>
        <Tab href="/admin/shop">Shop</Tab>
        <Tab href="/admin/orders">Orders</Tab>
        <Tab href="/admin/refunds">Refunds</Tab>
        <Tab href="/admin/door">Door</Tab>
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Stat({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link href={href} className="rounded-2xl bg-[var(--surface-2)] p-4 ring-1 ring-[var(--border)]">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-bold text-[var(--heading)]">{value}</div>
    </Link>
  );
}

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-xl bg-[var(--surface-3)] px-3 py-1.5 text-sm text-[var(--heading)] hover:bg-[var(--surface-4)]">
      {children}
    </Link>
  );
}
