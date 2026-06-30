import React from "react";

export default function StatCard({ icon: Icon, label, value, accent = "default", sublabel }) {
  const accentClasses = {
    default: "text-ink dark:text-paper",
    real: "text-verdict-real",
    fake: "text-verdict-fake",
    amber: "text-signal-amber",
  };

  return (
    <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-signal-slate">{label}</p>
        {Icon && <Icon size={18} className="text-signal-slate" />}
      </div>
      <p className={`mt-2 font-mono text-3xl font-semibold ${accentClasses[accent]}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-signal-slate">{sublabel}</p>}
    </div>
  );
}
