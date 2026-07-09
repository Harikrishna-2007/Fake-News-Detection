'use client';

import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  activeRoute?: string;
}

const NavIcon = ({ children }: { children: React.ReactNode }) => (
  <span className="flex-shrink-0 w-5 h-5">{children}</span>
);

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/home',
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </NavIcon>
    ),
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </NavIcon>
    ),
  },
  {
    label: 'News Analysis',
    href: '/news-analysis',
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      </NavIcon>
    ),
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z" />
          <path d="M15 9v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z" />
          <path d="M9 4v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z" />
        </svg>
      </NavIcon>
    ),
  },
  {
    label: 'Prediction History',
    href: '/prediction-history',
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </NavIcon>
    ),
  },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  activeRoute,
}: SidebarProps) {
  const isActive = (href: string) => {
    if (href === '/dashboard') return activeRoute === '/dashboard' || activeRoute === '/';
    return activeRoute === href;
  };

  return (
    <aside
      className={`
        flex flex-col h-full border-r transition-all duration-300 ease-in-out z-50
        fixed lg:relative
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'w-16' : 'w-60'}
      `}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Logo area */}
      <div
        className={`flex items-center border-b h-16 flex-shrink-0 ${collapsed ? 'justify-center px-3' : 'px-4 gap-3'}`}
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={32} />
          {!collapsed && (
            <span className="font-bold text-sm truncate" style={{ color: 'var(--foreground)' }}>
              FakeNewsDetector
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => { onToggleCollapse(); onMobileClose(); }}
            className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 lg:flex hidden"
            aria-label="Collapse sidebar"
            suppressHydrationWarning
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors hidden lg:flex"
            aria-label="Expand sidebar"
            suppressHydrationWarning
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors lg:hidden"
          aria-label="Close navigation"
          suppressHydrationWarning
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p
            className="text-xs font-600 uppercase tracking-widest mb-3 px-2"
            style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}
          >
            Main
          </p>
        )}
        {navItems.map((item) => (
          <Link
            key={`nav-${item.href}`}
            href={item.href}
            onClick={onMobileClose}
            className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge !== undefined && item.badge > 0 && (
              <span
                className="ml-auto text-xs font-700 px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)', fontSize: '11px' }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div
        className="border-t p-3 space-y-1"
        style={{ borderColor: 'var(--border)' }}
      >
        {!collapsed && (
          <div
            className="flex items-center gap-3 p-2 rounded-lg"
            style={{ backgroundColor: 'var(--secondary)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white' }}
            >
              U
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-600 truncate" style={{ color: 'var(--foreground)' }}>
                User
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                Student
              </p>
            </div>
          </div>
        )}
        <Link
          href="/sign-up-login-screen"
          className={`sidebar-nav-item ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </NavIcon>
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}