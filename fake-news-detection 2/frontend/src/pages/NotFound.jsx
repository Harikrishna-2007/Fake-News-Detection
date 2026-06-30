import React from "react";
import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center dark:bg-ink">
      <CompassIcon size={36} className="text-signal-slate" />
      <h1 className="font-display text-3xl font-bold">404</h1>
      <p className="max-w-sm text-signal-slate">This page doesn&rsquo;t exist — maybe it was fake all along.</p>
      <Link
        to="/dashboard"
        className="rounded-card bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:opacity-90 dark:bg-paper dark:text-ink"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
