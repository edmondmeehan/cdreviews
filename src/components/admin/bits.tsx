// Generic admin table shell shared across resources.
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AdminHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-4 border-b border-bone/10">
      <h1 className="fr-display text-[44px] text-bone">{title}</h1>
      {action}
    </div>
  );
}

export function AdminButton({ children, onClick, tone = "primary", type }: {
  children: ReactNode; onClick?: () => void; tone?: "primary" | "danger" | "ghost"; type?: "button" | "submit";
}) {
  const cls =
    tone === "danger" ? "bg-bone/0 text-vermil border-vermil/40 hover:bg-vermil hover:text-bone" :
    tone === "ghost" ? "bg-bone/0 text-bone/70 border-bone/20 hover:text-bone" :
    "bg-vermil text-bone border-vermil hover:bg-bone hover:text-ink";
  return (
    <button type={type ?? "button"} onClick={onClick} className={`font-mono text-[10px] tracking-[0.25em] uppercase px-4 py-2 border ${cls}`}>
      {children}
    </button>
  );
}

export function AdminLinkButton({ to, params, children }: { to: string; params?: Record<string, string>; children: ReactNode }) {
  return (
    <Link to={to} params={params} className="font-mono text-[10px] tracking-[0.25em] uppercase px-4 py-2 border bg-vermil text-bone border-vermil hover:bg-bone hover:text-ink">
      {children}
    </Link>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = "w-full bg-ink border border-bone/20 text-bone px-3 py-2 font-mono text-[12px] outline-none focus:border-vermil";
