import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading…", size = 22 }) {
  return (
    <div className="flex flex-col items-center gap-3 text-signal-slate" role="status">
      <Loader2 size={size} className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
