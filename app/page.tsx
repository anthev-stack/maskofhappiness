import { EventRow, toEventCard } from "@/components/event-row";
import { EventSection, PreviousEvents } from "@/components/event-list";
import { PlaylistSidebar } from "@/components/playlist-sidebar";
import { ShopGrid } from "@/components/shop-grid";
import { prisma } from "@/lib/prisma";
import { ACTIVE_TICKET_STATUSES } from "@/lib/tickets";
import { parseIdList } from "@/lib/shop";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const [upcoming, previous, playlists, setting, session, products] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      include: { _count: { select: { orders: { where: { status: { in: [...ACTIVE_TICKET_STATUSES] } } } } } },
    }),
    prisma.event.findMany({
      where: { published: true, startsAt: { lt: now } },
      orderBy: { startsAt: "desc" },
      include: { _count: { select: { orders: { where: { status: { in: [...ACTIVE_TICKET_STATUSES] } } } } } },
    }),
    prisma.playlist.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.setting.findUnique({ where: { id: "site" } }),
    getServerSession(authOptions),
    prisma.product.findMany({
      where: { status: "active" },
      include: { variants: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const isAdmin = session?.user?.role === "admin";
  const hasUpcoming = upcoming.length > 0;
  const homepageIds = parseIdList(setting?.homepageProductIds);
  const homepageProducts = homepageIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      {setting?.homepageLogoUrl ? (
        <section className="@container relative mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setting.homepageLogoUrl}
            alt="maskofhappiness"
            className="block h-auto w-full object-contain"
          />
          {setting.logoOverlay ? (
            <p
              className={`pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-[length:clamp(6.5px,2.35cqi,0.875rem)] leading-[1.35] font-light ${
                setting.logoOverlayUppercase ? "uppercase" : ""
              }`}
              style={{ color: setting.logoOverlayColor || "#b0bac5" }}
            >
              {setting.logoOverlay}
            </p>
          ) : null}
        </section>
      ) : null}

      {hasUpcoming ? (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div id="events" className="space-y-8">
            <EventSection title="Upcoming events" count={upcoming.length}>
              {upcoming.map((event) => (
                <EventRow key={event.id} event={toEventCard(event)} isAdmin={isAdmin} />
              ))}
            </EventSection>
            <PreviousEvents previous={previous} isAdmin={isAdmin} />
            <ShopGrid products={homepageProducts} />
          </div>
          <PlaylistSidebar
            playlists={playlists}
            title={setting?.listenTitle}
            blurb={setting?.listenBlurb}
          />
        </div>
      ) : (
        <div className="space-y-10">
          <PlaylistSidebar
            playlists={playlists}
            layout="grid"
            title={setting?.listenTitle}
            blurb={setting?.listenBlurb}
          />
          <div id="events" className="space-y-8">
            <PreviousEvents previous={previous} isAdmin={isAdmin} />
            <ShopGrid products={homepageProducts} />
          </div>
        </div>
      )}
    </div>
  );
}
