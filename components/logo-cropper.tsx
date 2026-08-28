"use client";

import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { cropToPng } from "@/lib/crop-image";

export function LogoCropper({
  image,
  onCancel,
  onComplete,
}: {
  image: string;
  onCancel: () => void;
  onComplete: (file: File) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, cropped: Area) => {
    setPixels(cropped);
  }, []);

  async function apply() {
    if (!pixels) return;
    setBusy(true);
    try {
      const blob = await cropToPng(image, pixels);
      onComplete(new File([blob], "homepage-logo.png", { type: "image/png" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[var(--surface-2)] p-4 ring-1 ring-[var(--border)]">
        <h3 className="mb-3 text-lg font-bold text-[var(--heading)]">Crop logo</h3>
        <p className="mb-3 text-sm text-[var(--muted)]">Drag to reposition. Use zoom to frame the logo. Transparency is kept.</p>
        <div className="relative h-[360px] overflow-hidden rounded-xl bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid
          />
        </div>
        <label className="mt-4 block text-sm">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl bg-[var(--surface-4)] px-4 py-2 text-sm text-[var(--heading)]">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={apply}
            className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[#032012] disabled:opacity-60"
          >
            {busy ? "Cropping…" : "Apply crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
