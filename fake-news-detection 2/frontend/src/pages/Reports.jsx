import React, { useState } from "react";
import { FileText, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { downloadHistoryPdf, downloadHistoryCsv } from "../services/historyService.js";
import ErrorBanner, { extractErrorMessage } from "../components/ErrorBanner.jsx";

export default function Reports() {
  const [downloading, setDownloading] = useState(null); // "pdf" | "csv" | null
  const [error, setError] = useState(null);

  const handleDownload = async (format) => {
    setError(null);
    setDownloading(format);
    try {
      if (format === "pdf") {
        await downloadHistoryPdf();
      } else {
        await downloadHistoryCsv();
      }
    } catch (err) {
      setError(extractErrorMessage(err, `Could not generate the ${format.toUpperCase()} report.`));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-signal-slate">
          Export your full prediction history for record-keeping or further analysis.
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <ReportCard
          icon={FileText}
          title="PDF Report"
          description="A formatted, shareable summary with stats and a full prediction table — ideal for printing or sharing."
          buttonLabel="Download PDF"
          isLoading={downloading === "pdf"}
          onClick={() => handleDownload("pdf")}
        />
        <ReportCard
          icon={FileSpreadsheet}
          title="CSV Export"
          description="Raw prediction data in spreadsheet-friendly format — ideal for importing into Excel or further analysis."
          buttonLabel="Download CSV"
          isLoading={downloading === "csv"}
          onClick={() => handleDownload("csv")}
        />
      </div>
    </div>
  );
}

function ReportCard({ icon: Icon, title, description, buttonLabel, isLoading, onClick }) {
  return (
    <div className="flex flex-col rounded-card border border-paper-border bg-paper-panel p-6 dark:border-ink-border dark:bg-ink-panel">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-paper text-ink dark:bg-ink dark:text-paper">
        <Icon size={20} />
      </div>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 flex-1 text-sm text-signal-slate">{description}</p>
      <button
        onClick={onClick}
        disabled={isLoading}
        className="mt-4 flex items-center justify-center gap-2 rounded-card bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-paper dark:text-ink"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {buttonLabel}
      </button>
    </div>
  );
}
