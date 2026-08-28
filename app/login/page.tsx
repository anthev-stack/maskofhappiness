"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      setError("Check your email and password.");
      return;
    }
    router.push(params.get("callbackUrl") || "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-6 ring-1 ring-[var(--border)]">
      <h1 className="text-2xl font-bold text-[var(--heading)]">Sign in</h1>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      {error ? <p className="text-sm text-[#ff6984]">{error}</p> : null}
      <button disabled={busy} className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-bold text-[#032012]">
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm">
        No account yet?{" "}
        <Link className="text-[var(--brand)]" href="/register">
          Create one
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
