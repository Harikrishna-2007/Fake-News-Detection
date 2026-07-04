'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Prediction {
  id: string;
  headline: string;
  label: 'REAL' | 'FAKE';
  confidence: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  category: string;
  date: string;
}

const predictions: Prediction[] = [
  {
    id: 'pred-001',
    headline: 'WHO confirms new respiratory illness spreading in Southeast Asia',
    label: 'REAL',
    confidence: 93.2,
    risk: 'LOW',
    source: 'Reuters',
    category: 'Health',
    date: 'Jul 3, 2026',
  },
  {
    id: 'pred-002',
    headline: 'Government secretly plans to microchip citizens through vaccine boosters',
    label: 'FAKE',
    confidence: 97.8,
    risk: 'CRITICAL',
    source: 'Unknown Blog',
    category: 'Politics',
    date: 'Jul 3, 2026',
  },
  {
    id: 'pred-003',
    headline: 'Stock market reaches all-time high amid tech sector recovery',
    label: 'REAL',
    confidence: 88.4,
    risk: 'LOW',
    source: 'Bloomberg',
    category: 'Finance',
    date: 'Jul 2, 2026',
  },
  {
    id: 'pred-004',
    headline: 'Scientists discover alien microbes on Mars surface, NASA confirms',
    label: 'FAKE',
    confidence: 91.6,
    risk: 'HIGH',
    source: 'ScienceDaily Parody',
    category: 'Science',
    date: 'Jul 2, 2026',
  },
  {
    id: 'pred-005',
    headline: 'India launches third lunar mission targeting south pole water deposits',
    label: 'REAL',
    confidence: 89.1,
    risk: 'LOW',
    source: 'ISRO Official',
    category: 'Science',
    date: 'Jul 1, 2026',
  },
  {
    id: 'pred-006',
    headline: 'Celebrity billionaire announces plan to replace all police with AI robots',
    label: 'FAKE',
    confidence: 86.3,
    risk: 'HIGH',
    source: 'Viral Tweet',
    category: 'Technology',
    date: 'Jul 1, 2026',
  },
  {
    id: 'pred-007',
    headline: 'Central bank raises interest rates by 0.25% to combat inflation',
    label: 'REAL',
    confidence: 94.7,
    risk: 'LOW',
    source: 'Financial Times',
    category: 'Finance',
    date: 'Jun 30, 2026',
  },
  {
    id: 'pred-008',
    headline: 'New study proves 5G towers cause memory loss and behavioral changes',
    label: 'FAKE',
    confidence: 95.2,
    risk: 'CRITICAL',
    source: 'Conspiracy Forum',
    category: 'Health',
    date: 'Jun 30, 2026',
  },
];

const riskColors: Record<string, string> = {
  LOW: 'risk-low',
  MEDIUM: 'risk-medium',
  HIGH: 'risk-high',
  CRITICAL: 'risk-critical',
};

export default function RecentPredictionsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = predictions.filter(
    (p) =>
      !deletedIds.has(p.id) &&
      (p.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: string, headline: string) => {
    setDeletingId(id);
    // Backend: DELETE /api/predictions/{id}
    setTimeout(() => {
      setDeletedIds((prev) => new Set([...prev, id]));
      setDeletingId(null);
      toast.success(`Prediction deleted`, {
        description: headline.slice(0, 50) + '...',
      });
    }, 600);
  };

  return (
    <div className="card-elevated rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--card)' }}>
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h3 className="text-base font-600" style={{ color: 'var(--foreground)' }}>
            Recent Predictions
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {filtered.length} of {predictions.length - deletedIds.size} analyses shown
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search predictions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 h-9 text-sm"
              style={{ width: '220px' }}
              suppressHydrationWarning
            />
          </div>
          <Link href="/news-analysis" className="btn-primary" style={{ height: '36px', padding: '0 14px', fontSize: '13px' }}>
            + New Analysis
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Headline', 'Label', 'Confidence', 'Risk', 'Category', 'Source', 'Date', 'Actions'].map((col) => (
                <th
                  key={`th-${col}`}
                  className="px-4 py-3 text-left text-xs font-600 uppercase tracking-wide"
                  style={{ color: 'var(--muted-foreground)', letterSpacing: '0.06em', backgroundColor: 'var(--muted)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--muted-foreground)' }}>
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <p className="text-sm font-500" style={{ color: 'var(--muted-foreground)' }}>
                      {searchTerm ? `No predictions matching "${searchTerm}"` : 'No analyses yet — submit your first article above'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((pred, i) => (
                <tr
                  key={pred.id}
                  className="group transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--muted)',
                    opacity: deletingId === pred.id ? 0.4 : 1,
                    transition: 'opacity 0.4s ease, background-color 150ms',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--secondary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      i % 2 === 0 ? 'transparent' : 'var(--muted)';
                  }}
                >
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="text-sm font-500 truncate" style={{ color: 'var(--foreground)' }} title={pred.headline}>
                      {pred.headline}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-700 ${pred.label === 'REAL' ? 'badge-real' : 'badge-fake'}`}
                    >
                      {pred.label === 'REAL' ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                      {pred.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-16 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--border)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pred.confidence}%`,
                            backgroundColor: pred.label === 'REAL' ? 'var(--success)' : 'var(--danger)',
                          }}
                        />
                      </div>
                      <span className="text-sm font-600 tabular-nums" style={{ color: 'var(--foreground)' }}>
                        {pred.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-600 ${riskColors[pred.risk]}`}
                    >
                      {pred.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {pred.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-500" style={{ color: 'var(--foreground)' }}>
                      {pred.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                      {pred.date}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(pred.id, pred.headline)}
                        disabled={deletingId === pred.id}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--danger-bg)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        }}
                        title="Delete this prediction — this cannot be undone"
                        aria-label="Delete prediction"
                        suppressHydrationWarning
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        className="flex items-center justify-between px-5 py-3 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Showing {filtered.length} results
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((page) => (
            <button
              key={`page-${page}`}
              className="w-7 h-7 rounded-lg text-xs font-600 transition-colors"
              style={{
                backgroundColor: page === 1 ? 'var(--primary)' : 'transparent',
                color: page === 1 ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}