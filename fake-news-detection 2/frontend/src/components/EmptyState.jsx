import React from "react";

/** An empty screen is an invitation to act — always paired with a next step. */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-paper-border px-6 py-14 text-center dark:border-ink-border">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-panel text-signal-slate dark:bg-ink-panel">
          <Icon size={22} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-signal-slate">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
