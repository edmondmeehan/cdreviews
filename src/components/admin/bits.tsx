// Generic admin table shell shared across resources.
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AdminHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between mb-8 pb-4 border-b border-ink/10">
      <h1 className="min-w-0 break-words fr-display text-[36px] sm:text-[44px] text-ink">{title}</h1>
      {action}
    </div>
  );
}

export function AdminButton({ children, onClick, tone = "primary", type, disabled }: {
  children: ReactNode; onClick?: () => void; tone?: "primary" | "danger" | "ghost"; type?: "button" | "submit"; disabled?: boolean;
}) {
  const cls =
    tone === "danger" ? "bg-ink/0 text-vermil border-vermil/40 hover:bg-vermil hover:text-ink" :
    tone === "ghost" ? "bg-ink/0 text-ink/70 border-ink/20 hover:text-ink" :
    "bg-vermil text-night border-vermil hover:bg-ink hover:text-bone";
  return (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={`font-mono text-[10px] tracking-[0.25em] uppercase min-h-11 inline-flex items-center justify-center px-4 py-2 border disabled:opacity-50 disabled:pointer-events-none ${cls}`}>
      {children}
    </button>
  );
}

export function AdminLinkButton({ to, params, children }: { to: string; params?: Record<string, string>; children: ReactNode }) {
  return (
    <Link to={to} params={params} className="font-mono text-[10px] tracking-[0.25em] uppercase min-h-11 inline-flex items-center justify-center px-4 py-2 border bg-vermil text-night border-vermil hover:bg-ink hover:text-bone">
      {children}
    </Link>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = "w-full min-w-0 max-w-full bg-bone border border-ink/20 text-ink px-3 py-2 font-mono text-[16px] sm:text-[12px] outline-none focus:border-vermil";
