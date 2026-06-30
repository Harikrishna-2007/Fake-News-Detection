import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ScanSearch,
  History,
  BarChart3,
  FileDown,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/detect", label: "Detect News", icon: ScanSearch },
  { to: "/history", label: "History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileDown },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-paper-border bg-paper-panel
        transition-transform duration-200 dark:border-ink-border dark:bg-ink-panel
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between px-5 lg:justify-start">
          <a href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-display text-sm font-bold text-paper dark:bg-paper dark:text-ink">
              V
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Veritas</span>
          </a>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-signal-slate hover:bg-paper dark:hover:bg-ink lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 space-y-1 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                    : "text-signal-slate hover:bg-paper hover:text-ink dark:hover:bg-ink dark:hover:text-paper"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-paper-border dark:border-ink-border" />
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-signal-amber/15 text-signal-amber"
                      : "text-signal-slate hover:bg-paper hover:text-ink dark:hover:bg-ink dark:hover:text-paper"
                  }`
                }
              >
                <ShieldCheck size={18} strokeWidth={2} />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
