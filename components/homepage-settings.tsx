"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoCropper } from "@/components/logo-cropper";

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  const upload = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await upload.json();
  if (!upload.ok) throw new Error(data.error ?? "Could not upload logo.");
  return data.url as string;
}

export function HomepageSettings({
  logoUrl,
  sourceUrl,
  accentColor,
  title,
  blurb,
  overlay,
  overlayUppercase,
  overlayColor,
  products,
  homepageProductIds,
}: {
  logoUrl: string | null;
  sourceUrl: string | null;
  accentColor: string;
  title: string;
  blurb: string;
  overlay: string;
  overlayUppercase: boolean;
  overlayColor: string;
  products: { id: string; title: string; imageUrl: string | null }[];
  homepageProductIds: string[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(logoUrl);
  const [source, setSource] = useState(sourceUrl);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingSource, setPendingSource] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [accent, setAccent] = useState(accentColor);
  const [listenTitle, setListenTitle] = useState(title);
  const [listenBlurb, setListenBlurb] = useState(blurb);
  const [logoOverlay, setLogoOverlay] = useState(overlay);
  const [overlayCaps, setOverlayCaps] = useState(overlayUppercase);
  const [overlayTint, setOverlayTint] = useState(overlayColor);
  const [picked, setPicked] = useState<string[]>(homepageProductIds);
  const [picking, setPicking] = useState(false);

  function onPick(file: File | undefined) {
    if (!file) return;
    setError("");
    const url = URL.createObjectURL(file);
    setPendingSource(url);
    setCropSrc(url);
  }

  function editCurrent() {
    const src = source || current;
    if (!src) return;
    setPendingSource(null);
    setCropSrc(src);
  }

  async function saveSetting(homepageLogoUrl: string | null, homepageLogoSourceUrl?: string | null) {
    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homepageLogoUrl, homepageLogoSourceUrl }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Could not save.");
    setCurrent(json.setting.homepageLogoUrl);
    setSource(json.setting.homepageLogoSourceUrl);
    router.refresh();
  }

  async function saveOverlay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoOverlay,
          logoOverlayUppercase: overlayCaps,
          logoOverlayColor: overlayTint,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save overlay.");
      setLogoOverlay(json.setting.logoOverlay);
      setOverlayCaps(Boolean(json.setting.logoOverlayUppercase));
      setOverlayTint(json.setting.logoOverlayColor);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save overlay.");
    } finally {
      setBusy(false);
    }
  }

  async function saveListenCopy() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listenTitle, listenBlurb }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save listen copy.");
      setListenTitle(json.setting.listenTitle);
      setListenBlurb(json.setting.listenBlurb);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save listen copy.");
    } finally {
      setBusy(false);
    }
  }

  async function saveHomepageProducts() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepageProductIds: picked }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save homepage products.");
      setPicking(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save homepage products.");
    } finally {
      setBusy(false);
    }
  }

  async function saveColor() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accentColor: accent }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save colour.");
      setAccent(json.setting.accentColor);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save colour.");
    } finally {
      setBusy(false);
    }
  }

  async function onCropped(file: File) {
    setBusy(true);
    setError("");
    try {
      let nextSource = source;
      if (pendingSource) {
        const original = await fetch(pendingSource).then((res) => res.blob());
        nextSource = await uploadFile(new File([original], "logo-source.png", { type: original.type || "image/png" }));
      }
      const croppedUrl = await uploadFile(file);
      await saveSetting(croppedUrl, nextSource ?? croppedUrl);
      setCropSrc(null);
      setPendingSource(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Remove the homepage logo?")) return;
    setBusy(true);
    try {
      await saveSetting(null, null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[var(--heading)]">Homepage settings</h2>
      <p className="mt-1 mb-5 text-sm text-[var(--muted)]">
        Settings sit in columns. New blocks will keep stacking down the page.
      </p>
      {error ? <p className="mb-4 text-sm text-[#ff6984]">{error}</p> : null}

      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
          <h3 className="text-base font-bold text-[var(--heading)]">Homepage image</h3>
          <p className="text-sm text-[var(--muted)]">
            Upload a wide transparent PNG, then crop it. You can recrop later without losing the original.
          </p>
          {current ? (
            <div className="rounded-xl bg-[var(--surface-3)] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current} alt="Homepage logo" className="mx-auto max-h-40 w-full object-contain" />
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">No logo uploaded.</p>
          )}
          <div>
            <label>Logo (PNG)</label>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/webp,image/jpeg,image/gif"
              onChange={(event) => onPick(event.target.files?.[0])}
            />
          </div>
          <div>
            <label>Logo overlay text</label>
            <input
              value={logoOverlay}
              onChange={(event) => setLogoOverlay(event.target.value)}
              placeholder="Centered over the logo"
            />
            <p className="mt-1 text-sm text-[var(--muted)]">Same size and weight as the nav tabs. Leave blank for no overlay.</p>
            <label className="mt-3 flex items-center gap-2 text-sm text-[var(--heading)]">
              <input
                type="checkbox"
                checked={overlayCaps}
                onChange={(event) => setOverlayCaps(event.target.checked)}
                className="h-4 w-4"
              />
              Uppercase
            </label>
            <div className="mt-3">
              <label>Overlay colour</label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="color"
                  value={overlayTint}
                  onChange={(event) => setOverlayTint(event.target.value)}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <span className="text-sm uppercase text-[var(--muted)]">{overlayTint}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveOverlay()}
              className="rounded-xl bg-[var(--brand)] px-4 py-2 font-bold text-[#032012] disabled:opacity-60"
            >
              Save overlay
            </button>
            {current ? (
              <button
                type="button"
                disabled={busy}
                onClick={editCurrent}
                className="rounded-xl bg-[var(--brand)] px-4 py-2.5 font-bold text-[#032012] disabled:opacity-60"
              >
                Edit crop
              </button>
            ) : null}
            {current ? (
              <button
                type="button"
                disabled={busy}
                onClick={remove}
                className="rounded-xl bg-[var(--surface-4)] px-4 py-2.5 text-sm text-[#ff6984]"
              >
                Remove logo
              </button>
            ) : null}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
          <h3 className="text-base font-bold text-[var(--heading)]">Site colours</h3>
          <div>
            <label>Site colour</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <span className="text-sm uppercase text-[var(--muted)]">{accent}</span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">Used for nav hover, badges, and buttons. Default is red.</p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveColor()}
            className="rounded-xl bg-[var(--brand)] px-4 py-2 font-bold text-[#032012] disabled:opacity-60"
          >
            Save colour
          </button>
        </section>

        <section className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
          <h3 className="text-base font-bold text-[var(--heading)]">Spotify settings</h3>
          <div>
            <label>Spotify heading</label>
            <input value={listenTitle} onChange={(event) => setListenTitle(event.target.value)} />
          </div>
          <div>
            <label>Spotify blurb</label>
            <textarea rows={3} value={listenBlurb} onChange={(event) => setListenBlurb(event.target.value)} />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveListenCopy()}
            className="rounded-xl bg-[var(--brand)] px-4 py-2 font-bold text-[#032012] disabled:opacity-60"
          >
            Save Spotify copy
          </button>
        </section>

        <section className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
          <h3 className="text-base font-bold text-[var(--heading)]">Homepage shop</h3>
          <p className="text-sm text-[var(--muted)]">
            Choose which products appear under Previous events. If none are selected, the homepage shop stays hidden.
          </p>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="rounded-xl bg-[var(--brand)] px-4 py-2 font-bold text-[#032012]"
          >
            Add products to homepage
          </button>
          {picked.length > 0 ? (
            <p className="text-sm text-[var(--heading)]">{picked.length} selected</p>
          ) : null}
        </section>
      </div>

      {picking ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
            <h3 className="text-lg font-bold text-[var(--heading)]">Add products to homepage</h3>
            <p className="mt-1 mb-4 text-sm text-[var(--muted)]">Select as many as you want.</p>
            {products.length === 0 ? (
              <p className="text-sm">No active products yet. Add some in Shop first.</p>
            ) : (
              <div className="space-y-2">
                {products.map((product) => {
                  const on = picked.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl bg-[var(--surface-3)] p-3"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          setPicked((ids) =>
                            on ? ids.filter((id) => id !== product.id) : [...ids, product.id]
                          )
                        }
                        className="h-4 w-4"
                      />
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--surface-4)] text-xs font-bold text-[var(--brand)]">
                          {product.title.slice(0, 1)}
                        </div>
                      )}
                      <span className="text-sm text-[var(--heading)]">{product.title}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveHomepageProducts()}
                className="rounded-xl bg-[var(--brand)] px-4 py-2 font-bold text-[#032012] disabled:opacity-60"
              >
                Save homepage products
              </button>
              <button
                type="button"
                onClick={() => {
                  setPicked(homepageProductIds);
                  setPicking(false);
                }}
                className="rounded-xl bg-[var(--surface-4)] px-4 py-2 text-sm text-[var(--heading)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cropSrc ? (
        <LogoCropper
          image={cropSrc}
          onCancel={() => {
            setCropSrc(null);
            setPendingSource(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          onComplete={onCropped}
        />
      ) : null}
    </div>
  );
}
