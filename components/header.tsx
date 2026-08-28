"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { CartNavLink } from "@/components/cart-nav-link";

const item =
  "whitespace-nowrap px-3 py-1.5 font-light uppercase text-[var(--muted)] transition-colors hover:text-[var(--brand)]";

export function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  const links = (
    <>
      <Link className={item} href="/#events" onClick={close}>
        Events
      </Link>
      <Link className={item} href="/#listen" onClick={close}>
        Listen
      </Link>
      <Link className={item} href="/shop" onClick={close}>
        Shop
      </Link>
      <CartNavLink className={item} onClick={close} />
      {session?.user ? (
        <>
          <Link className={item} href="/tickets" onClick={close}>
            My tickets
          </Link>
          <Link className={item} href="/account" onClick={close}>
            Account
          </Link>
          {session.user.role === "admin" ? (
            <Link className={item} href="/admin" onClick={close}>
              Dashboard
            </Link>
          ) : null}
          <button
            className={`${item} w-full text-left`}
            onClick={() => {
              close();
              void signOut({ callbackUrl: "/" });
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link className={item} href="/login" onClick={close}>
            Sign in
          </Link>
          <Link className={`${item} font-semibold`} href="/register" onClick={close}>
            Create account
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-[1400px] items-center justify-between gap-2 px-4 py-2">
        <Link href="/" className="text-[15px] font-bold tracking-tight text-[var(--heading)]" onClick={close}>
          maskofhappiness
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">{links}</nav>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center text-[var(--heading)] md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <span className="text-2xl leading-none">×</span>
          ) : (
            <span className="flex flex-col gap-1.5">
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-5 bg-current" />
            </span>
          )}
        </button>
      </div>

      <div
        className={`grid md:hidden ${open ? "grid-rows-[1fr] border-[var(--border)]" : "grid-rows-[0fr] border-transparent"} border-t transition-[grid-template-rows,border-color] duration-300 ease-out`}
      >
        <nav className="overflow-hidden">
          <div className="flex flex-col px-4 py-3 text-sm">{links}</div>
        </nav>
      </div>
    </header>
  );
}
