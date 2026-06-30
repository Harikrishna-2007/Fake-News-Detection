import React, { useEffect, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { getHistory } from "../services/historyService.js";
import HistoryTable from "../components/HistoryTable.jsx";
import ErrorBanner, { extractErrorMessage } from "../components/ErrorBanner.jsx";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 350;

export default function History() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [label, setLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce free-text search so we don't fire a request on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, label]);

  const fetchHistory = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getHistory({ search: debouncedSearch, label: label || undefined, page, pageSize: PAGE_SIZE })
      .then((data) => {
        setItems(data.items);
        setTotalPages(data.total_pages);
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load your prediction history.")))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, label, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Prediction History</h1>
        <p className="mt-1 text-sm text-signal-slate">Every article you&rsquo;ve analyzed, searchable and filterable.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-slate" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or article text…"
            className="w-full rounded-card border border-paper-border bg-paper-panel py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-signal-amber dark:border-ink-border dark:bg-ink-panel"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-signal-slate hover:text-ink dark:hover:text-paper"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 rounded-card border border-paper-border bg-paper-panel p-1 dark:border-ink-border dark:bg-ink-panel">
          {[
            { value: "", label: "All" },
            { value: "REAL", label: "Real" },
            { value: "FAKE", label: "Fake" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setLabel(option.value)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                label === option.value
                  ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                  : "text-signal-slate hover:text-ink dark:hover:text-paper"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <HistoryTable items={items} page={page} totalPages={totalPages} onPageChange={setPage} isLoading={isLoading} />
    </div>
  );
}
