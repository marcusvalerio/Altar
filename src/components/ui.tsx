import Link from "next/link";
import type { ComponentProps } from "react";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2.5 ${className}`}>
      <span className="font-display text-[1.375rem] leading-none tracking-[0.06em] text-ink">ALTAR</span>
      <span className="eyebrow text-[0.625rem]">Devocional Espírita</span>
    </span>
  );
}

/** Container mobile-first; no desktop vira uma coluna central confortável. */
export function Screen({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <main className={`pb-nav mx-auto w-full max-w-xl px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-8 ${className}`}>{children}</main>;
}

export function ScreenHeader({ title, subtitle, back }: { title?: string; subtitle?: string; back?: { href: string; label: string } }) {
  return (
    <header className="mb-8 pt-4">
      {back && (
        <Link href={back.href} className="-ml-2 mb-6 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-muted hover:text-ink">
          <span aria-hidden="true">←</span> {back.label}
        </Link>
      )}
      {title && <h1 className="font-display text-[2.125rem] leading-[1.1] text-ink">{title}</h1>}
      {subtitle && <p className="mt-2 text-[0.9375rem] text-muted">{subtitle}</p>}
    </header>
  );
}

type ButtonProps = { variant?: "primary" | "quiet" | "ghost" | "onSpecial"; className?: string };

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.9375rem] font-medium transition-[background-color,color,transform,border-color] duration-300 ease-[var(--ease-calm)] active:scale-[0.98] disabled:opacity-50";
const variants = {
  primary: "bg-ink text-bg hover:bg-ink-2",
  quiet: "border border-line bg-transparent text-ink hover:border-ink",
  ghost: "text-ink hover:bg-surface-2/60",
  onSpecial: "bg-special-ink text-special hover:opacity-90",
};

export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonProps & ComponentProps<typeof Link>) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps & ComponentProps<"button">) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-line ${className}`} />;
}
