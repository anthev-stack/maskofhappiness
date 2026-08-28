export const ACTIVE_TICKET_STATUSES = ["paid", "claimed", "refund_pending"] as const;
export const SCANNABLE_TICKET_STATUSES = ["paid", "claimed", "refund_pending"] as const;

export const REFUND_CUTOFF_MS = 48 * 60 * 60 * 1000;

export function canRequestRefund(startsAt: Date, now = new Date()) {
  return startsAt.getTime() - now.getTime() >= REFUND_CUTOFF_MS;
}

export function ticketStockLabel(taken: number, capacity: number | null, isAdmin: boolean) {
  if (!capacity) return null;
  const remaining = Math.max(capacity - taken, 0);
  if (isAdmin) return `${taken}/${capacity}`;
  if (remaining <= 0) return "Sold out";
  if (remaining / capacity <= 0.15) return "Limited tickets left";
  return null;
}
