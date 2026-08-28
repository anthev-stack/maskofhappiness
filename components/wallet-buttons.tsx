"use client";

async function addToWallet(path: string, filename?: string) {
  const res = await fetch(path, { redirect: "manual" });
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("Location");
    if (location) {
      window.location.href = location;
      return;
    }
  }
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || type.includes("application/json")) {
    const data = await res.json().catch(() => ({}));
    alert(data.error ?? "Could not add this ticket to your wallet.");
    return;
  }
  if (filename) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

function AppleWalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden>
      <path
        fill="currentColor"
        d="M16.7 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-1.9-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.8-1.6.1-3.1 1-4 2.5-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.6-3.9zm-2.5-7.3c.7-.8 1.2-2 .1-3.3-1.1.1-2.3.8-3 1.7-.7.8-1.2 2-.1 3.2 1.2.1 2.3-.6 3-1.6z"
      />
    </svg>
  );
}

function GoogleWalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M3 7.5A3.5 3.5 0 0 1 6.5 4H18a3 3 0 0 1 3 3v1.2H7.2A4.2 4.2 0 0 0 3 12.4V7.5Z" />
      <path fill="#34A853" d="M3 12.2A4.3 4.3 0 0 1 7.3 8h13.2v8.5A3.5 3.5 0 0 1 17 20H6.5A3.5 3.5 0 0 1 3 16.5v-4.3Z" />
      <path fill="#FBBC05" d="M14.2 13.1a2.4 2.4 0 1 1 0 4.8H7.4v-4.8h6.8Z" />
      <path fill="#EA4335" d="M16.6 15.5a2.4 2.4 0 1 1 2.4 2.4 2.4 2.4 0 0 1-2.4-2.4Z" />
    </svg>
  );
}

export function WalletButtons({ code }: { code: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => void addToWallet(`/api/tickets/${code}/apple`, `maskofhappiness-${code}.pkpass`)}
        className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-black px-3.5 text-white ring-1 ring-white/20"
      >
        <AppleWalletIcon />
        <span className="text-left leading-tight">
          <span className="block text-[9px] uppercase tracking-wide text-white/70">Add to</span>
          <span className="block text-sm font-semibold">Apple Wallet</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => void addToWallet(`/api/tickets/${code}/google`)}
        className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-black px-3.5 text-white ring-1 ring-white/20"
      >
        <GoogleWalletIcon />
        <span className="text-left leading-tight">
          <span className="block text-[9px] uppercase tracking-wide text-white/70">Add to</span>
          <span className="block text-sm font-semibold">Google Wallet</span>
        </span>
      </button>
    </div>
  );
}
