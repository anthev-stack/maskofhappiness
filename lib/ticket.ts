export const TICKET_PREFIX = "moh:";

export function ticketPayload(code: string) {
  return `${TICKET_PREFIX}${code}`;
}

export function parseTicketPayload(raw: string) {
  const value = raw.trim();
  if (value.startsWith(TICKET_PREFIX)) {
    return value.slice(TICKET_PREFIX.length).trim().toUpperCase();
  }
  return value.trim().toUpperCase();
}

export function formatUsedAt(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
