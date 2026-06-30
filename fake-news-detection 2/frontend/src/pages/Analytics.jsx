import React, { useEffect, useState } from "react";
import { getAnalytics } from "../services/historyService.js";
import { VerdictBreakdownChart, PredictionsOverTimeChart } from "../components/Charts.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner, { extractErrorMessage } from "../components/ErrorBanner.jsx";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAnalytics()
      .then((data) => isMounted && setAnalytics(data))
      .catch((err) => isMounted && setError(extractErrorMessage(err, "Could not load analytics.")))
      .finally(() => isMounted && setIsLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner label="Crunching the numbers…" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onDismiss={() => setError(null)} />;
  }

  if (!analytics || analytics.total_analyzed === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Analytics</h1>
        <div className="rounded-card border border-dashed border-paper-border py-16 text-center text-signal-slate dark:border-ink-border">
          Analyze a few articles first — your analytics will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-signal-slate">A deeper look at your detection activity and model performance.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel">
          <h2 className="mb-3 font-display text-base font-semibold">Verdict Breakdown</h2>
          <VerdictBreakdownChart realCount={analytics.real_count} fakeCount={analytics.fake_count} />
        </div>
        <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel">
          <h2 className="mb-3 font-display text-base font-semibold">30-Day Trend</h2>
          <PredictionsOverTimeChart series={analytics.predictions_over_time} />
        </div>
      </div>

      {analytics.model_metrics && (
        <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel">
          <h2 className="mb-1 font-display text-base font-semibold">Model Evaluation Metrics</h2>
          <p className="mb-4 text-sm text-signal-slate">
            Computed on a held-out test set during the most recent training run of the active model.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Accuracy", analytics.model_metrics.accuracy],
              ["Precision", analytics.model_metrics.precision],
              ["Recall", analytics.model_metrics.recall],
              ["F1 Score", analytics.model_metrics.f1],
            ].map(([label, value]) => (
              <div key={label} className="rounded-card bg-paper p-4 text-center dark:bg-ink">
                <p className="text-xs text-signal-slate">{label}</p>
                <p className="mt-1 font-mono text-2xl font-semibold">{(value * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
