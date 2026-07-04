'use client';

import React, { useEffect, useRef } from 'react';
import type { PredictionResult } from './NewsAnalysisContent';

interface Props {
  result: PredictionResult;
  savedToHistory: boolean;
  onSaveToHistory: () => void;
}

const riskConfig = {
  LOW: { label: 'LOW RISK', color: 'var(--success)', bg: 'var(--success-bg)', width: '20%' },
  MEDIUM: { label: 'MEDIUM RISK', color: 'var(--warning)', bg: 'var(--warning-bg)', width: '50%' },
  HIGH: { label: 'HIGH RISK', color: '#EA580C', bg: '#FFF7ED', width: '75%' },
  CRITICAL: { label: 'CRITICAL RISK', color: 'var(--danger)', bg: 'var(--danger-bg)', width: '100%' },
};

function ConfidenceGauge({ confidence, label }: { confidence: number; label: 'REAL' | 'FAKE' }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeColor = label === 'REAL' ? 'var(--success)' : 'var(--danger)';
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-3xl font-800 tabular-nums"
          style={{ color: strokeColor, lineHeight: 1 }}
        >
          {confidence}
        </span>
        <span className="text-xs font-600 mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          %
        </span>
        <span className="text-xs font-500 mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Confidence
        </span>
      </div>
    </div>
  );
}

export default function AnalysisResultCard({ result, savedToHistory, onSaveToHistory }: Props) {
  const risk = riskConfig[result.risk];

  const handleExport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="result-entrance space-y-4">
      {/* Main verdict card */}
      <div
        className="card-elevated rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: result.label === 'REAL' ? 'var(--success-border)' : 'var(--danger-border)',
          borderWidth: '2px',
        }}
      >
        {/* Verdict header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background:
              result.label === 'REAL' ?'linear-gradient(to right, var(--success-bg), var(--card))' :'linear-gradient(to right, var(--danger-bg), var(--card))',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: result.label === 'REAL' ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {result.label === 'REAL' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
                Prediction Result
              </p>
              <p
                className="text-2xl font-800"
                style={{ color: result.label === 'REAL' ? 'var(--success)' : 'var(--danger)' }}
              >
                {result.label} NEWS
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-700 ${result.label === 'REAL' ? 'badge-real' : 'badge-fake'}`}
          >
            {result.label}
          </span>
        </div>

        {/* Gauge + risk */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-center gap-6">
          <ConfidenceGauge confidence={result.confidence} label={result.label} />

          <div className="flex-1 space-y-4 w-full">
            {/* Risk level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-600 uppercase tracking-wide" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.06em' }}>
                  Risk Level
                </span>
                <span
                  className="text-xs font-700 px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: risk.bg, color: risk.color }}
                >
                  {risk.label}
                </span>
              </div>
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: risk.width, backgroundColor: risk.color }}
                />
              </div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Processing', value: `${result.processingTime}s` },
                { label: 'Word Count', value: result.wordCount.toString() },
                { label: 'Model', value: result.modelVersion },
              ].map((meta) => (
                <div
                  key={`meta-${meta.label}`}
                  className="rounded-lg p-2.5 text-center"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{meta.label}</p>
                  <p className="text-xs font-700 mt-0.5 tabular-nums truncate" style={{ color: 'var(--foreground)' }}>
                    {meta.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div className="card-elevated rounded-xl p-5" style={{ backgroundColor: 'var(--card)' }}>
        <h4 className="text-sm font-600 mb-2" style={{ color: 'var(--foreground)' }}>
          Prediction Summary
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {result.summary}
        </p>
      </div>

      {/* Linguistic signals */}
      <div className="card-elevated rounded-xl p-5" style={{ backgroundColor: 'var(--card)' }}>
        <h4 className="text-sm font-600 mb-3" style={{ color: 'var(--foreground)' }}>
          Linguistic Signals Detected
        </h4>
        <div className="space-y-2">
          {result.linguisticSignals.length > 0 ? (
            result.linguisticSignals.map((signal, i) => (
              <div
                key={`signal-${i}`}
                className="flex items-start gap-2.5 p-2.5 rounded-lg"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: result.label === 'FAKE' ? 'var(--danger-bg)' : 'var(--success-bg)',
                    color: result.label === 'FAKE' ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  {result.label === 'FAKE' ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <p className="text-xs font-500" style={{ color: 'var(--foreground)' }}>
                  {signal}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              No significant linguistic signals detected.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSaveToHistory}
          disabled={savedToHistory}
          className="btn-primary flex-1"
        >
          {savedToHistory ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved to History
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save to History
            </>
          )}
        </button>
        <button
          onClick={handleExport}
          className="btn-secondary"
          aria-label="Export report"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}