import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatConfidence, confidenceBand } from "../utils/format.js";

/**
 * ResultCard — the app's signature visual element. Renders a
 * prediction like a verification stamp (rotated badge, ink-style
 * border) rather than a generic "AI confidence bar," reinforcing that
 * this is a verdict being recorded, not a casual guess. The needle
 * gauge below it gives the confidence score the feel of a measuring
 * instrument rather than a progress bar borrowed from a loading screen.
 */
export default function ResultCard({ result }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timeout = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timeout);
  }, [result?.id]);

  if (!result) return null;

  const isFake = result.predicted_label === "FAKE";
  const confidence = result.confidence_score;
  // Map confidence (0.5-1.0 meaningful range) to a needle angle from -90deg to +90deg.
  const needleAngle = -90 + Math.min(Math.max((confidence - 0.5) / 0.5, 0), 1) * 180;

  const palette = isFake
    ? {
        ink: "text-verdict-fake",
        bg: "bg-verdict-fakeBg dark:bg-verdict-fake/10",
        border: "border-verdict-fake",
        Icon: XCircle,
        word: "FAKE",
      }
    : {
        ink: "text-verdict-real",
        bg: "bg-verdict-realBg dark:bg-verdict-real/10",
        border: "border-verdict-real",
        Icon: CheckCircle2,
        word: "REAL",
      };

  return (
    <div className="grid gap-6 sm:grid-cols-[auto,1fr] sm:items-center">
      {/* The stamp */}
      <div
        key={result.id}
        className={`relative flex h-32 w-32 shrink-0 -rotate-3 items-center justify-center rounded-xl border-[3px] ${palette.border} ${palette.bg} ${
          mounted ? "animate-stamp-in" : "opacity-0"
        }`}
        style={{ borderStyle: "double" }}
        role="img"
        aria-label={`Verdict: ${palette.word}, ${formatConfidence(confidence)} confidence`}
      >
        <div className="flex flex-col items-center gap-1">
          <palette.Icon size={28} className={palette.ink} strokeWidth={2.2} />
          <span className={`font-display text-xl font-bold tracking-wide ${palette.ink}`}>
            {palette.word}
          </span>
        </div>
      </div>

      {/* The instrument: confidence gauge + breakdown */}
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-signal-slate">
            Confidence: <span className="font-medium text-ink dark:text-paper">{confidenceBand(confidence)}</span>
          </p>
          <p className="font-mono text-2xl font-semibold">{formatConfidence(confidence)}</p>
        </div>

        {/* Needle gauge */}
        <div className="relative mt-3 h-14 w-full max-w-xs">
          <svg viewBox="0 0 200 110" className="h-full w-full overflow-visible">
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              className="text-paper-border dark:text-ink-border"
            />
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(confidence) * 283} 283`}
              className={palette.ink}
            />
            <g
              style={{ "--needle-angle": `${needleAngle}deg`, transformOrigin: "100px 100px" }}
              className="animate-needle-sweep"
            >
              <line x1="100" y1="100" x2="100" y2="32" stroke="currentColor" strokeWidth="3" className="text-ink dark:text-paper" />
              <circle cx="100" cy="100" r="6" fill="currentColor" className="text-ink dark:text-paper" />
            </g>
          </svg>
        </div>

        <div className="mt-2 flex gap-5 text-xs text-signal-slate">
          <span>
            REAL <span className="font-mono font-medium text-verdict-real">{formatConfidence(result.real_probability)}</span>
          </span>
          <span>
            FAKE <span className="font-mono font-medium text-verdict-fake">{formatConfidence(result.fake_probability)}</span>
          </span>
          <span className="ml-auto">
            Model: <span className="font-medium text-ink dark:text-paper">{result.model_used}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
