"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "Could not create account.");
      return;
    }
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-6 ring-1 ring-[var(--border)]">
        <h1 className="text-2xl font-bold text-[var(--heading)]">Create account</h1>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={6} required />
        </div>
        {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
        <button disabled={busy} className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-bold text-[#032012]">
          {busy ? "Creating…" : "Join the community"}
        </button>
        <p className="text-sm">
          Already have an account?{" "}
          <Link className="text-[var(--brand)]" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
