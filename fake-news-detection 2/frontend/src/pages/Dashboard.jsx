import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileSearch, CheckCircle2, XCircle, Gauge, ScanLine } from "lucide-react";
import { getAnalytics } from "../services/historyService.js";
import StatCard from "../components/StatCard.jsx";
import { VerdictBreakdownChart, PredictionsOverTimeChart } from "../components/Charts.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner, { extractErrorMessage } from "../components/ErrorBanner.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getAnalytics()
      .then((data) => {
        if (isMounted) setAnalytics(data);
      })
      .catch((err) => {
        if (isMounted) setError(extractErrorMessage(err, "Could not load your dashboard data."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-signal-slate">
            Here&rsquo;s a snapshot of your fact-checking activity.
          </p>
        </div>
        <Link
          to="/detect"
          className="flex items-center gap-2 rounded-card bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90 dark:bg-paper dark:text-ink"
        >
          <ScanLine size={16} /> Analyze an article
        </Link>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="Loading your dashboard…" />
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FileSearch} label="Total Analyzed" value={analytics.total_analyzed} />
            <StatCard
              icon={CheckCircle2}
              label="Real News"
              value={analytics.real_count}
              accent="real"
              sublabel={`${analytics.real_percentage}% of total`}
            />
            <StatCard
              icon={XCircle}
              label="Fake News"
              value={analytics.fake_count}
              accent="fake"
              sublabel={`${analytics.fake_percentage}% of total`}
            />
            <StatCard
              icon={Gauge}
              label="Avg. Confidence"
              value={`${(analytics.average_confidence * 100).toFixed(1)}%`}
              accent="amber"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel lg:col-span-1">
              <h2 className="mb-3 font-display text-base font-semibold">Verdict Breakdown</h2>
              <VerdictBreakdownChart realCount={analytics.real_count} fakeCount={analytics.fake_count} />
            </div>
            <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel lg:col-span-2">
              <h2 className="mb-3 font-display text-base font-semibold">Predictions Over Time</h2>
              <PredictionsOverTimeChart series={analytics.predictions_over_time} />
            </div>
          </div>

          {analytics.model_metrics && (
            <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel">
              <h2 className="mb-3 font-display text-base font-semibold">Active Model Performance</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Metric label="Accuracy" value={analytics.model_metrics.accuracy} />
                <Metric label="Precision" value={analytics.model_metrics.precision} />
                <Metric label="Recall" value={analytics.model_metrics.recall} />
                <Metric label="F1 Score" value={analytics.model_metrics.f1} />
              </div>
              <p className="mt-3 text-xs text-signal-slate">
                Metrics computed on a held-out test set during the most recent training run.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs text-signal-slate">{label}</p>
      <p className="font-mono text-xl font-semibold">{(value * 100).toFixed(1)}%</p>
    </div>
  );
}
