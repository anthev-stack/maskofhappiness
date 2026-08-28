"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  const upload = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await upload.json();
  if (!upload.ok) throw new Error(data.error ?? "Could not upload.");
  return data.url as string;
}

type SeoState = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
  faviconUrl: string;
  appleIconUrl: string;
  themeColor: string;
  appleAppTitle: string;
};

export function SiteSettings(props: SeoState) {
  const router = useRouter();
  const [form, setForm] = useState<SeoState>(props);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function set<K extends keyof SeoState>(key: K, value: SeoState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onUpload(key: "ogImageUrl" | "faviconUrl" | "appleIconUrl", file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      set(key, await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload.");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    const res = await fetch("/api/admin/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      return;
    }
    setSaved("Site settings saved.");
    router.refresh();
  }

  const title = form.seoTitle || "maskofhappiness";
  const description = form.seoDescription || "Community events and shared listening from maskofhappiness.";
  const shareImage = form.ogImageUrl || form.appleIconUrl;
  const icon = form.faviconUrl || form.appleIconUrl;
  const homeIcon = form.appleIconUrl || form.faviconUrl || form.ogImageUrl;

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-bold uppercase text-[var(--heading)]">SEO</h2>
        <div>
          <label htmlFor="seoTitle">Page title</label>
          <input id="seoTitle" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </div>
        <div>
          <label htmlFor="seoDescription">Meta description</label>
          <textarea
            id="seoDescription"
            rows={4}
            value={form.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="seoKeywords">Keywords</label>
          <input
            id="seoKeywords"
            value={form.seoKeywords}
            onChange={(e) => set("seoKeywords", e.target.value)}
            placeholder="events, merch, playlists"
          />
        </div>
        <div>
          <label htmlFor="appleAppTitle">Apple home screen name</label>
          <input
            id="appleAppTitle"
            value={form.appleAppTitle}
            onChange={(e) => set("appleAppTitle", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="themeColor">Browser / iOS theme colour</label>
          <input id="themeColor" type="color" value={form.themeColor} onChange={(e) => set("themeColor", e.target.value)} />
        </div>
        <ImageField
          label="Favicon"
          hint="Square PNG or ICO. Shows in browser tabs and Google."
          value={form.faviconUrl}
          onFile={(file) => void onUpload("faviconUrl", file)}
          onClear={() => set("faviconUrl", "")}
        />
        <ImageField
          label="Apple touch icon"
          hint="180×180 PNG. Home screen and some share sheets."
          value={form.appleIconUrl}
          onFile={(file) => void onUpload("appleIconUrl", file)}
          onClear={() => set("appleIconUrl", "")}
        />
        <ImageField
          label="Share / Open Graph image"
          hint="About 1200×630. iMessage, iOS share, Discord, Facebook."
          value={form.ogImageUrl}
          onFile={(file) => void onUpload("ogImageUrl", file)}
          onClear={() => set("ogImageUrl", "")}
        />
        {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
        {saved ? <p className="text-sm text-[var(--heading)]">{saved}</p> : null}
        <button disabled={busy} className="rounded-xl bg-[var(--brand)] px-4 py-2.5 font-bold text-[#032012]">
          {busy ? "Saving…" : "Save site settings"}
        </button>
      </div>

      <div className="space-y-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Preview</p>

        <PreviewFrame label="Google search">
          <div className="bg-white p-4 text-left">
            <div className="flex items-center gap-2 text-[12px] text-[#202124]">
              {icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={icon} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e8f0fe] text-[10px] font-bold text-[#1a73e8]">
                  m
                </span>
              )}
              <div>
                <div className="leading-tight">{title}</div>
                <div className="text-[#4d5156]">https://maskofhappiness.com</div>
              </div>
            </div>
            <p className="mt-1 text-[20px] leading-snug text-[#1a0dab]">{title}</p>
            <p className="mt-1 line-clamp-2 text-[14px] leading-5 text-[#4d5156]">{description}</p>
          </div>
        </PreviewFrame>

        <PreviewFrame label="iMessage / iOS share">
          <div className="bg-[#0b0b0d] p-4">
            <div className="overflow-hidden rounded-2xl bg-[#1c1c1e]">
              {shareImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shareImage} alt="" className="aspect-[1.91/1] w-full object-cover" />
              ) : (
                <div className="grid aspect-[1.91/1] place-items-center text-sm text-[#8e8e93]">Share image</div>
              )}
              <div className="px-3 py-2.5">
                <p className="truncate text-[13px] font-semibold text-white">{title}</p>
                <p className="truncate text-[11px] uppercase tracking-wide text-[#8e8e93]">maskofhappiness.com</p>
              </div>
            </div>
          </div>
        </PreviewFrame>

        <div className="grid gap-4 sm:grid-cols-2">
          <PreviewFrame label="Safari tab">
            <div className="bg-[#1d1d1f] px-3 py-4">
              <div className="mx-auto flex max-w-[220px] items-center gap-2 rounded-lg bg-[#2c2c2e] px-3 py-2">
                {icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={icon} alt="" className="h-4 w-4 rounded-sm object-cover" />
                ) : (
                  <span className="h-4 w-4 rounded-sm bg-[var(--brand)]" />
                )}
                <span className="truncate text-[11px] text-white">{title}</span>
              </div>
            </div>
          </PreviewFrame>
          <PreviewFrame label="iPhone home screen">
            <div className="bg-gradient-to-b from-[#3a3a3c] to-[#1c1c1e] px-4 py-5 text-center">
              {homeIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={homeIcon}
                  alt=""
                  className="mx-auto h-16 w-16 rounded-[14px] object-cover shadow-lg"
                />
              ) : (
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-[14px] bg-[var(--brand)] text-lg font-black text-white">
                  m
                </div>
              )}
              <p className="mt-2 truncate text-[11px] text-white">{form.appleAppTitle || title}</p>
            </div>
          </PreviewFrame>
        </div>
      </div>
    </form>
  );
}

function PreviewFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <div className="overflow-hidden rounded-2xl ring-1 ring-[var(--border)]">{children}</div>
    </div>
  );
}

function ImageField({
  label,
  hint,
  value,
  onFile,
  onClear,
}: {
  label: string;
  hint: string;
  value: string;
  onFile: (file: File | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <p className="mb-1 text-sm text-[var(--heading)]">{label}</p>
      <p className="mb-2 text-xs text-[var(--muted)]">{hint}</p>
      {value ? (
        <div className="mb-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-[var(--border)]" />
          <button type="button" className="text-xs uppercase text-[var(--muted)]" onClick={onClear}>
            Remove
          </button>
        </div>
      ) : null}
      <input type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.[0])} />
    </div>
  );
}
