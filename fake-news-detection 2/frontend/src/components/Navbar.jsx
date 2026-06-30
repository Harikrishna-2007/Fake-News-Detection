import React, { useState, useRef, useEffect } from "react";
import { Menu, Sun, Moon, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useTheme } from "../hooks/useTheme.jsx";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-paper-border bg-paper/90 px-4 backdrop-blur dark:border-ink-border dark:bg-ink/90 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-signal-slate hover:bg-paper-panel dark:hover:bg-ink-panel lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-signal-slate transition-colors hover:bg-paper-panel hover:text-ink dark:hover:bg-ink-panel dark:hover:text-paper"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2.5 text-sm hover:bg-paper-panel dark:hover:bg-ink-panel"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper dark:bg-paper dark:text-ink">
              {initials}
            </span>
            <span className="hidden font-medium sm:inline">{user?.full_name || user?.email}</span>
            <ChevronDown size={14} className="text-signal-slate" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-card border border-paper-border bg-paper-panel py-1 shadow-stamp dark:border-ink-border dark:bg-ink-panel">
              <div className="border-b border-paper-border px-3 py-2 dark:border-ink-border">
                <p className="truncate text-sm font-medium">{user?.full_name || "Account"}</p>
                <p className="truncate text-xs text-signal-slate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-verdict-fake hover:bg-verdict-fakeBg dark:hover:bg-verdict-fake/10"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
