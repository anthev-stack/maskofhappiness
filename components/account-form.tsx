"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";

export function AccountForm({ name, email }: { name: string; email: string }) {
  const { update } = useSession();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    const form = event.currentTarget;
    const fields = new FormData(form);
    const payload = {
      name: String(fields.get("name") ?? ""),
      currentPassword: String(fields.get("currentPassword") ?? ""),
      newPassword: String(fields.get("newPassword") ?? ""),
    };
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      return;
    }
    await update({ name: data.name });
    form.querySelector<HTMLInputElement>('[name="currentPassword"]')!.value = "";
    form.querySelector<HTMLInputElement>('[name="newPassword"]')!.value = "";
    setSaved(payload.newPassword ? "Name and password saved." : "Name saved.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-6 ring-1 ring-[var(--border)]">
      <h1 className="text-2xl font-bold uppercase text-[var(--heading)]">Account</h1>
      <div>
        <label htmlFor="name">Username</label>
        <input id="name" name="name" defaultValue={name} required minLength={2} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={email} readOnly />
      </div>
      <div>
        <label htmlFor="currentPassword">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="newPassword">New password</label>
        <input id="newPassword" name="newPassword" type="password" minLength={6} autoComplete="new-password" />
        <p className="mt-1 text-xs text-[var(--muted)]">Leave both password fields blank to keep your current password.</p>
      </div>
      {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
      {saved ? <p className="text-sm text-[var(--heading)]">{saved}</p> : null}
      <button disabled={busy} className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-bold text-[#032012]">
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
