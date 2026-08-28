export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatMoney(cents: number, currency = "AUD") {
  if (cents <= 0) return "Free";
  return formatPrice(cents, currency);
}

export function formatPrice(cents: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatOrderStatus(status: string) {
  if (status === "refund_pending") return "Refund pending";
  if (status === "refunded") return "Refunded";
  return status;
}

export function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function extractSpotifyId(url: string) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}

export function spotifyEmbedUrl(url: string) {
  const id = extractSpotifyId(url);
  return id ? `https://open.spotify.com/embed/playlist/${id}?utm_source=generator` : null;
}
