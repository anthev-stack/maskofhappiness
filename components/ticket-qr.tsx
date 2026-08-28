"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ticketPayload } from "@/lib/ticket";

export function TicketQr({ code }: { code: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(ticketPayload(code), {
      width: 160,
      margin: 1,
      color: { dark: "#032012", light: "#ffffff" },
    }).then(setSrc);
  }, [code]);

  if (!src) {
    return <div className="h-[88px] w-[88px] shrink-0 rounded-lg bg-white/90" />;
  }

  return (
    <img src={src} alt={`Ticket QR ${code}`} className="h-[88px] w-[88px] shrink-0 rounded-lg bg-white p-1" />
  );
}
