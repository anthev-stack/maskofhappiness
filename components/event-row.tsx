import Link from "next/link";
import { formatEventDate, formatMoney } from "@/lib/utils";
import { ticketStockLabel } from "@/lib/tickets";

export type EventCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  priceCents: number;
  currency: string;
  capacity: number | null;
  imageUrl?: string | null;
  accessCodeEnabled?: boolean;
  _count?: { orders: number };
};

export function toEventCard(event: EventCard & { accessCode?: string }): EventCard {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt,
    priceCents: event.priceCents,
    currency: event.currency,
    capacity: event.capacity,
    imageUrl: event.imageUrl,
    accessCodeEnabled: Boolean(event.accessCodeEnabled),
    _count: event._count,
  };
}

export function EventRow({
  event,
  past = false,
  isAdmin = false,
}: {
  event: EventCard;
  past?: boolean;
  isAdmin?: boolean;
}) {
  const taken = event._count?.orders ?? 0;
  const stock = ticketStockLabel(taken, event.capacity, isAdmin);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex gap-4 rounded-2xl bg-[var(--surface-2)] p-4 ring-1 ring-[var(--border)] transition hover:bg-[var(--surface-3)]"
    >
      {event.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.imageUrl}
          alt=""
          className="h-[88px] w-[88px] shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-xl bg-[var(--surface-4)] text-2xl font-black text-[var(--brand)]">
          {event.title.slice(0, 1)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-bold text-[var(--heading)] group-hover:text-white">
              {event.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--muted)]">
              {event.description}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm text-[var(--muted)]">
            <div className="font-semibold text-[var(--heading)]">
              {formatMoney(event.priceCents, event.currency)}
            </div>
            {stock ? <div className="mt-1">{stock}</div> : null}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--surface-4)] px-2.5 py-0.5 text-xs text-[var(--heading)]">
            {event.location}
          </span>
          <span className="rounded-full bg-[var(--surface-4)] px-2.5 py-0.5 text-xs text-[var(--heading)]">
            {formatEventDate(event.startsAt)}
          </span>
          {event.accessCodeEnabled ? (
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-xs text-[var(--brand)]">
              Exclusive event
            </span>
          ) : null}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs ${past ? "bg-[var(--surface-4)] text-[var(--muted)]" : "bg-[var(--brand-soft)] text-[var(--brand)]"}`}
          >
            {past ? "Previous" : event.priceCents > 0 ? "Tickets" : "Free"}
          </span>
        </div>
      </div>
    </Link>
  );
}
