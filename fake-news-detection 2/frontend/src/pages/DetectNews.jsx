import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import NewsInputForm from "../components/NewsInputForm.jsx";
import ResultCard from "../components/ResultCard.jsx";
import ErrorBanner, { extractErrorMessage } from "../components/ErrorBanner.jsx";
import { predictText, predictFile } from "../services/predictionService.js";

export default function DetectNews() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setError(null);
    setIsSubmitting(true);
    setResult(null);
    try {
      const data =
        payload.type === "text"
          ? await predictText(payload.text, payload.title)
          : await predictFile(payload.file);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not analyze this article. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Detect News</h1>
        <p className="mt-1 text-sm text-signal-slate">
          Paste an article or upload a text file to check whether it&rsquo;s likely real or fake.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] lg:items-start">
        <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel">
          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            </div>
          )}
          <NewsInputForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel">
          <h2 className="mb-4 font-display text-base font-semibold">Verdict</h2>
          {result ? (
            <ResultCard result={result} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-signal-slate">
              <ShieldCheck size={32} className="opacity-40" />
              <p className="max-w-xs text-sm">
                Submit an article on the left to see its REAL/FAKE verdict and confidence score here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
