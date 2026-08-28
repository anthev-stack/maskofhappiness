"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { formatUsedAt } from "@/lib/ticket";

type ScanResult = {
  approved: boolean;
  reason: string;
  detail?: string;
  usedAtLabel?: string;
  usedAt?: string;
  guest?: string;
};

export function TicketScanner({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const busy = useRef(false);
  const lastCode = useRef("");
  const lastAt = useRef(0);

  const handleCode = useCallback(
    async (raw: string) => {
      const now = Date.now();
      if (busy.current) return;
      if (raw === lastCode.current && now - lastAt.current < 2500) return;

      busy.current = true;
      lastCode.current = raw;
      lastAt.current = now;

      try {
        const res = await fetch("/api/admin/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, payload: raw }),
        });
        const data = (await res.json()) as ScanResult;
        if (data.usedAt && !data.usedAtLabel) {
          data.usedAtLabel = formatUsedAt(new Date(data.usedAt));
        }
        setResult(data);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(data.approved ? 40 : [40, 40, 40]);
        }
      } catch {
        setResult({ approved: false, reason: "Could not check this ticket" });
      } finally {
        window.setTimeout(() => {
          busy.current = false;
        }, 700);
      }
    },
    [eventId]
  );

  useEffect(() => {
    const scanner = new Html5Qrcode("door-scanner");
    let stopped = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 260, height: 260 } },
        (decoded) => {
          void handleCode(decoded);
        },
        () => undefined
      )
      .then(() => setReady(true))
      .catch(() => {
        setError("Camera access is needed to scan tickets. Allow the camera, then reload.");
      });

    return () => {
      stopped = true;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => undefined);
      void stopped;
    };
  }, [handleCode]);

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 text-sm text-[var(--muted)]">
        Point the camera at a ticket. It stays on so you can keep scanning.
      </p>
      <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-[var(--border)]">
        <div id="door-scanner" className="min-h-[280px] w-full bg-black" />
      </div>
      {!ready && !error ? (
        <p className="mt-3 text-sm text-[var(--muted)]">Starting camera…</p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-[#ff6984]">{error}</p> : null}

      {result ? (
        <div
          className={`mt-4 rounded-2xl p-5 text-center ${
            result.approved ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "bg-[#3d1218] text-[#ff6984]"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em]">
            {result.approved ? "Approved" : "Denied"}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-white">{result.reason}</p>
          {result.guest ? <p className="mt-2 text-sm text-white/80">{result.guest}</p> : null}
          {result.detail ? <p className="mt-1 text-sm text-white/80">{result.detail}</p> : null}
          {result.usedAtLabel ? (
            <p className="mt-2 text-sm text-white/80">Used {result.usedAtLabel}</p>
          ) : null}
          <p className="mt-3 text-xs text-white/50">{eventTitle}</p>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-[var(--muted)]">Waiting for a ticket…</p>
      )}
    </div>
  );
}
