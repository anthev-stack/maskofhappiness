import { EventRow, toEventCard, type EventCard } from "@/components/event-row";

export function EventSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl font-bold text-[var(--heading)]">{title}</h2>
        <span className="text-sm text-[var(--muted)]">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function PreviousEvents({
  previous,
  isAdmin = false,
}: {
  previous: EventCard[];
  isAdmin?: boolean;
}) {
  return (
    <EventSection title="Previous events" count={previous.length}>
      {previous.length === 0 ? (
        <p className="rounded-2xl bg-[var(--surface-2)] p-6 text-sm text-[var(--muted)] ring-1 ring-[var(--border)]">
          Archive is empty for now.
        </p>
      ) : (
        previous.map((event) => (
          <EventRow key={event.id} event={toEventCard(event)} past isAdmin={isAdmin} />
        ))
      )}
    </EventSection>
  );
}
