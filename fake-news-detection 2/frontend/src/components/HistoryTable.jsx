import React from "react";
import { ChevronLeft, ChevronRight, FileQuestion } from "lucide-react";
import { formatDateTime, formatConfidence, truncate, verdictColors } from "../utils/format.js";
import EmptyState from "./EmptyState.jsx";

export default function HistoryTable({ items, page, totalPages, onPageChange, isLoading }) {
  if (!isLoading && items.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No matching predictions"
        description="Try adjusting your search or filters, or analyze a new article from the Detect News page."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-paper-border dark:border-ink-border">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-paper-border bg-paper-panel text-xs uppercase tracking-wide text-signal-slate dark:border-ink-border dark:bg-ink-panel">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium">Verdict</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Model</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-paper-border last:border-0 dark:border-ink-border">
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="h-4 animate-pulse rounded bg-paper-border dark:bg-ink-border" />
                    </td>
                  </tr>
                ))
              : items.map((item) => {
                  const colors = verdictColors(item.predicted_label);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-paper-border last:border-0 hover:bg-paper-panel/60 dark:border-ink-border dark:hover:bg-ink-panel/60"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-signal-slate">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-md font-medium">
                          {item.article_title || truncate(item.article_text, 60)}
                        </p>
                        {item.article_title && (
                          <p className="max-w-md text-xs text-signal-slate">
                            {truncate(item.article_text, 70)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
                        >
                          {item.predicted_label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono">
                        {formatConfidence(item.confidence_score)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-signal-slate">{item.model_used}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-paper-border px-4 py-3 dark:border-ink-border">
          <p className="text-xs text-signal-slate">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-md border border-paper-border px-2.5 py-1.5 text-xs font-medium hover:bg-paper-panel disabled:cursor-not-allowed disabled:opacity-40 dark:border-ink-border dark:hover:bg-ink-panel"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-md border border-paper-border px-2.5 py-1.5 text-xs font-medium hover:bg-paper-panel disabled:cursor-not-allowed disabled:opacity-40 dark:border-ink-border dark:hover:bg-ink-panel"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
