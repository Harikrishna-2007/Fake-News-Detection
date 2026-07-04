import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  colSpan?: string;
}

function MetricCard({ label, value, subtext, icon, trend, variant = 'default', colSpan }: MetricCardProps) {
  const variantStyles: Record<string, { bg: string; iconBg: string; iconColor: string; border: string }> = {
    default: {
      bg: 'var(--card)',
      iconBg: 'var(--secondary)',
      iconColor: 'var(--primary)',
      border: 'var(--border)',
    },
    success: {
      bg: 'var(--success-bg)',
      iconBg: '#A7F3D0',
      iconColor: 'var(--success)',
      border: 'var(--success-border)',
    },
    danger: {
      bg: 'var(--danger-bg)',
      iconBg: '#FECACA',
      iconColor: 'var(--danger)',
      border: 'var(--danger-border)',
    },
    warning: {
      bg: 'var(--warning-bg)',
      iconBg: '#FDE68A',
      iconColor: 'var(--warning)',
      border: 'var(--warning-border)',
    },
    info: {
      bg: 'var(--info-bg)',
      iconBg: '#BAE6FD',
      iconColor: 'var(--info)',
      border: 'var(--info-border)',
    },
  };

  const s = variantStyles[variant];

  return (
    <div
      className={`card-elevated card-hover rounded-xl p-5 flex flex-col gap-4 ${colSpan || ''}`}
      style={{ backgroundColor: s.bg, borderColor: s.border }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: s.iconBg, color: s.iconColor }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="text-xs font-600 px-2 py-1 rounded-full"
            style={{
              backgroundColor: trend.positive ? '#ECFDF5' : '#FEF2F2',
              color: trend.positive ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-500 uppercase tracking-wide mb-1" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p className="text-3xl font-700 tabular-nums" style={{ color: 'var(--foreground)' }}>
          {value}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {subtext}
        </p>
      </div>
    </div>
  );
}

export default function DashboardMetrics() {
  // Grid plan: 6 cards → grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6
  // Row 1 (desktop): all 6 cards in one row at 2xl
  // Row 1+2 (tablet): 3+3
  // Mobile: 2+2+2
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      <MetricCard
        label="Total Analyses"
        value="1,284"
        subtext="Since account creation"
        trend={{ value: '12.4%', positive: true }}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z" />
            <path d="M15 9v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z" />
            <path d="M9 4v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z" />
          </svg>
        }
      />
      <MetricCard
        label="Fake Detected"
        value="743"
        subtext="57.9% of all analyses"
        trend={{ value: '8.2%', positive: false }}
        variant="danger"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        }
      />
      <MetricCard
        label="Real Verified"
        value="541"
        subtext="42.1% of all analyses"
        trend={{ value: '4.7%', positive: true }}
        variant="success"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        }
      />
      <MetricCard
        label="Avg Confidence"
        value="87.3%"
        subtext="Model certainty score"
        trend={{ value: '2.1%', positive: true }}
        variant="info"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        }
      />
      <MetricCard
        label="High-Risk Flagged"
        value="214"
        subtext="Confidence &gt; 85% FAKE"
        trend={{ value: '18.6%', positive: false }}
        variant="warning"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
      />
      <MetricCard
        label="This Week"
        value="38"
        subtext="Analyses in last 7 days"
        trend={{ value: '21.3%', positive: true }}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        }
      />
    </div>
  );
}